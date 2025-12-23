import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { useToast } from '../../components/ui/useToast'

import { Table } from '../../components/tables/Table'
import { TableSkeleton } from '../../components/tables/TableSkeleton'
import { Pagination } from '../../components/tables/Pagination'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Pencil, Trash } from 'lucide-react'
import { createCategory, deleteCategory, updateCategory } from '../../api/services/categoryService'
import { getErrorMessage } from '../../utils/httpError'
import { getItems, getTotal } from '../../utils/paginated'
import { usePaginationSearchParams } from '../../hooks/usePaginationSearchParams'
import { useCategoryListQuery } from '../../hooks/useCategoryListQuery'

export default memo(function CategoryListPage() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const { page, pageSize, setPage, setPageSize } = usePaginationSearchParams()

  const [searchDraft, setSearchDraft] = useState('')
  const [searchBy, setSearchBy] = useState('')

  useEffect(() => {
    const t = window.setTimeout(() => setSearchBy(searchDraft.trim()), 350)
    return () => window.clearTimeout(t)
  }, [searchDraft])

  const q = useCategoryListQuery({ page, pageSize, searchBy: searchBy || undefined })

  const rows = useMemo(() => getItems(q.data), [q.data])
  const total = useMemo(() => getTotal(q.data), [q.data])

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    description: '',
    variant: 'danger',
    isLoading: false,
    onConfirm: () => { },
  })

  const openConfirm = (opts) => setConfirmState({ ...opts, isOpen: true })
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }))

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })

  const openCreate = useCallback(() => {
    setEditing(null)
    setForm({ name: '', description: '' })
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((c) => {
    setEditing(c)
    setForm({ name: c?.name || '', description: c?.description || '' })
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditing(null)
  }, [])

  const createM = useMutation({
    mutationFn: (payload) => createCategory(payload),
    onSuccess: () => {
      toast({ title: 'Category created', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['categories'] })
      closeModal()
    },
    onError: (err) => toast({ title: 'Create failed', description: getErrorMessage(err), variant: 'error' }),
  })

  const updateM = useMutation({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: () => {
      toast({ title: 'Category updated', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['categories'] })
      closeModal()
    },
    onError: (err) => toast({ title: 'Update failed', description: getErrorMessage(err), variant: 'error' }),
  })

  const deleteM = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      toast({ title: 'Category deleted', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err) => {
      toast({ title: 'Delete failed', description: getErrorMessage(err), variant: 'error' })
      closeConfirm()
    },
    onSuccess: () => {
      toast({ title: 'Category deleted', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['categories'] })
      closeConfirm()
    }
  })

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault()
      const payload = { name: form.name.trim(), description: form.description.trim() }
      if (!payload.name) {
        toast({ title: 'Missing name', description: 'Category name is required.', variant: 'error' })
        return
      }

      const id = editing?._id || editing?.id
      if (id) updateM.mutate({ id, payload })
      else createM.mutate(payload)
    },
    [createM, editing, form, toast, updateM],
  )

  const columns = useMemo(
    () => [
      { key: 'name', header: 'Category', cell: (r) => r.name || '—' },
      { key: 'description', header: 'Description', cell: (r) => r.description || '—' },
      { key: 'updatedAt', header: 'Updated', cell: (r) => r.updatedAt || '—' },
      {
        key: 'actions',
        header: 'Actions',
        cell: (r) => {
          const id = r._id || r.id
          const isDeleting = deleteM.isPending && confirmState.targetId === id

          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => openEdit(r)} title="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                isLoading={isDeleting}
                onClick={() => {
                  if (!id) return
                  openConfirm({
                    targetId: id,
                    title: 'Delete Category?',
                    description: `Are you sure you want to delete "${r.name}"?`,
                    onConfirm: () => deleteM.mutate(id)
                  })
                }}
                title="Delete"
              >
                {!isDeleting && <Trash className="h-4 w-4" />}
              </Button>
            </div>
          )
        },
      },
    ],
    [deleteM, openEdit, confirmState.targetId],
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title="Category Management"
        right={
          <div className="flex items-center gap-2">
            <Button onClick={openCreate}>Add Category</Button>
          </div>
        }
      />

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="mb-1 text-xs font-medium text-slate-600">Search category name</p>
            <Input value={searchDraft} onChange={(e) => setSearchDraft(e.target.value)} placeholder="Electronics" />
          </div>
          <div className="md:col-span-4">
            <p className="mb-1 text-xs font-medium text-slate-600">Rows</p>
            <Select value={String(pageSize)} onChange={(val) => setPageSize(Number(val))}>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </div>
        </div>
      </Card>

      {q.isLoading && !q.data ? (
        <TableSkeleton cols={4} />
      ) : q.isError ? (
        <EmptyState title="Failed to load categories" description={getErrorMessage(q.error)} />
      ) : rows.length ? (
        <Table columns={columns} rows={rows} rowKey={(r) => r._id || r.id} />
      ) : (
        <EmptyState title="No categories" description="No data returned." />
      )}

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-slate-950/40 p-4">
          <div className="w-full max-w-xl">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {editing ? 'Edit category' : 'Add category'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  Close
                </Button>
              </div>

              <form className="mt-4 grid grid-cols-1 gap-3" onSubmit={onSubmit}>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">Name</p>
                  <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">Description</p>
                  <textarea
                    className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" type="button" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={createM.isPending || updateM.isPending}
                    disabled={createM.isPending || updateM.isPending}
                  >
                    {editing ? 'Save changes' : 'Create'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      ) : null}


      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        description={confirmState.description}
        isLoading={deleteM.isPending}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  )
})
