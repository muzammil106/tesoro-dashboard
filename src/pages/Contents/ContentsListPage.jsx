import { memo, useCallback, useMemo, useState } from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
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
import {
  createContent,
  deleteContent,
  updateContent,
  getContentDetail,
} from '../../api/services/contentService'
import { Pencil, Trash } from 'lucide-react'
import { getErrorMessage } from '../../utils/httpError'
import { getItems, getTotal } from '../../utils/paginated'
import { usePaginationSearchParams } from '../../hooks/usePaginationSearchParams'
import { useContentListQuery } from '../../hooks/useContentListQuery'

export default memo(function ContentsListPage() {
  const qc = useQueryClient()
  const { toast } = useToast()

  const { page, pageSize, setPage, setPageSize } = usePaginationSearchParams()
  const q = useContentListQuery({ page, pageSize })

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
  const [form, setForm] = useState({ name: '', content: '' })

  const openCreate = useCallback(() => {
    setEditing(null)
    setForm({ name: '', content: '' })
    setModalOpen(true)
  }, [])

  const detailM = useMutation({
    mutationFn: (id) => getContentDetail(id),
    onSuccess: (data) => {
      setForm({ name: data.name, content: data.content || '' })
    },
    onError: (err) => toast({ title: 'Failed to load content', description: getErrorMessage(err), variant: 'error' }),
  })

  const openEdit = useCallback((c) => {
    const id = c?._id || c?.id
    if (!id) return

    setEditing(c)
    // Open immediately with available data (name), content empty while fetching
    setForm({ name: c.name, content: '' })
    setModalOpen(true)

    // Fetch details
    detailM.mutate(id)
  }, [detailM])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditing(null)
  }, [])

  const createM = useMutation({
    mutationFn: (payload) => createContent(payload),
    onSuccess: () => {
      toast({ title: 'Content created', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['contents'] })
      closeModal()
    },
    onError: (err) => toast({ title: 'Create failed', description: getErrorMessage(err), variant: 'error' }),
  })

  const updateM = useMutation({
    mutationFn: ({ id, payload }) => updateContent(id, payload),
    onSuccess: () => {
      toast({ title: 'Content updated', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['contents'] })
      closeModal()
    },
    onError: (err) => toast({ title: 'Update failed', description: getErrorMessage(err), variant: 'error' }),
  })

  const deleteM = useMutation({
    mutationFn: (id) => deleteContent(id),
    onSuccess: () => {
      toast({ title: 'Content deleted', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['contents'] })
      closeConfirm()
    },
    onError: (err) => {
      toast({ title: 'Delete failed', description: getErrorMessage(err), variant: 'error' })
      closeConfirm()
    },
  })

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault()
      const payload = { name: form.name.trim(), content: form.content }
      if (!payload.name) {
        toast({ title: 'Missing name', description: 'Content name is required.', variant: 'error' })
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
      { key: 'name', header: 'Name', cell: (r) => r.name || '—' },
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
                isLoading={isDeleting}
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => {
                  if (!id) return
                  openConfirm({
                    targetId: id,
                    title: 'Delete Content?',
                    description: `Are you sure you want to delete "${r.name}"? This action cannot be undone.`,
                    onConfirm: () => deleteM.mutate(id),
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
        title="Content Management"
        right={
          <div className="flex items-center gap-2">
            <Button onClick={openCreate}>Add Content</Button>
          </div>
        }
      />

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-12">
            <p className="mb-1 text-xs font-medium text-slate-600">Rows</p>
            <div className="w-24">
              <Select value={String(pageSize)} onChange={(e) => setPageSize(Number(e.target.value))}>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {q.isLoading && !q.data ? (
        <TableSkeleton cols={3} />
      ) : q.isError ? (
        <EmptyState title="Failed to load contents" description={getErrorMessage(q.error)} />
      ) : rows.length ? (
        <Table columns={columns} rows={rows} rowKey={(r) => r._id || r.id} />
      ) : (
        <EmptyState title="No contents" description="No data returned." />
      )}

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-slate-950/40 p-4">
          <div className="w-full max-w-4xl">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {editing ? 'Edit content' : 'Add content'}
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
                  <p className="mb-1 text-xs font-medium text-slate-600">Content (HTML allowed)</p>
                  <div className="bg-white">
                    {detailM.isPending ? (
                      <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
                        <span className="flex items-center gap-2">
                          Loading...
                        </span>
                      </div>
                    ) : (
                      <ReactQuill
                        theme="snow"
                        value={form.content}
                        onChange={(value) => setForm((p) => ({ ...p, content: value }))}
                        className="h-64 mb-12"
                      />
                    )}
                  </div>
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
