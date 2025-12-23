import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, Pencil, Trash } from 'lucide-react'
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
import { createTreasure, deleteTreasure, updateTreasure } from '../../api/services/treasureService'
import { getErrorMessage } from '../../utils/httpError'
import { getItems, getTotal } from '../../utils/paginated'
import { routePaths } from '../../routes/routePaths'
import { useCategoryListQuery } from '../../hooks/useCategoryListQuery'
import { usePaginationSearchParams } from '../../hooks/usePaginationSearchParams'
import { useTreasureListQuery } from '../../hooks/useTreasureListQuery'

function cleanParam(value) {
  const v = String(value || '').trim()
  return v ? v : ''
}

export default memo(function TreasureListPage() {
  const [sp, setSp] = useSearchParams()
  const qc = useQueryClient()
  const { toast } = useToast()

  // Keep pagination in URL (existing pattern) and allow extra filters to co-exist in search params.
  const { page, pageSize, setPage, setPageSize } = usePaginationSearchParams()

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

  const scope = cleanParam(sp.get('scope')) || 'all'
  const condition = cleanParam(sp.get('condition'))
  const category = cleanParam(sp.get('category'))
  const searchBy = cleanParam(sp.get('searchBy'))

  const [searchDraft, setSearchDraft] = useState(searchBy)

  const setFilterParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(sp)
      const v = cleanParam(value)

      if (v) next.set(key, v)
      else next.delete(key)

      // reset pagination when filters change
      next.set('page', '1')
      next.set('pageSize', String(pageSize))

      setSp(next)
    },
    [pageSize, setSp, sp],
  )

  // Debounced search: typing triggers fetch, no "Search" button needed.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (searchDraft.trim() === searchBy) return
      setFilterParam('searchBy', searchDraft)
    }, 350)

    return () => window.clearTimeout(t)
  }, [searchBy, searchDraft, setFilterParam])

  const onPageChange = useCallback((p) => setPage(p), [setPage])

  const categoriesQuery = useCategoryListQuery({ page: 1, pageSize: 100 })
  const categoryRows = useMemo(() => getItems(categoriesQuery.data), [categoriesQuery.data])
  const categoryById = useMemo(() => {
    const map = new Map()
    for (const c of categoryRows) {
      const id = c._id || c.id
      if (!id) continue
      map.set(id, c.name || c.title || id)
    }
    return map
  }, [categoryRows])

  const q = useTreasureListQuery({
    page,
    pageSize,
    scope,
    searchBy: searchBy || undefined,
    condition: condition || undefined,
    category: category || undefined,
  })

  const rows = useMemo(() => getItems(q.data), [q.data])
  const total = useMemo(() => getTotal(q.data), [q.data])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    title: '',
    price: '',
    category: '',
    condition: 'Used',
    brand: '',
    itemModel: 'NA',
    type: 'Accessory',
    description: '',
    address: '',
    lat: '',
    lng: '',
    placeId: '',
    photos: '',
  })

  const openCreate = useCallback(() => {
    setEditing(null)
    setForm({
      title: '',
      price: '',
      category: category || '',
      condition: condition || 'Used',
      brand: '',
      itemModel: 'NA',
      type: 'Accessory',
      description: '',
      address: '',
      lat: '',
      lng: '',
      placeId: '',
      photos: '',
    })
    setModalOpen(true)
  }, [category, condition])

  const openEdit = useCallback(
    (t) => {
      setEditing(t)
      const coords = t?.location?.coordinates || []
      const lng0 = Array.isArray(coords) ? coords[0] : ''
      const lat0 = Array.isArray(coords) ? coords[1] : ''

      setForm({
        title: t?.title || '',
        price: t?.price ?? '',
        category: t?.category || '',
        condition: t?.condition || 'Used',
        brand: t?.brand || '',
        itemModel: t?.itemModel || 'NA',
        type: t?.type || 'Accessory',
        description: t?.description || '',
        address: t?.location?.address || '',
        lat: lat0 ?? '',
        lng: lng0 ?? '',
        placeId: t?.location?.placeId || '',
        photos: Array.isArray(t?.photos) ? t.photos.join('\n') : '',
      })
      setModalOpen(true)
    },
    [setModalOpen],
  )

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditing(null)
  }, [])

  const createM = useMutation({
    mutationFn: (payload) => createTreasure(payload),
    onSuccess: () => {
      toast({ title: 'Treasure created', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['treasures'] })
      closeModal()
    },
    onError: (err) => {
      toast({ title: 'Create failed', description: getErrorMessage(err), variant: 'error' })
    },
  })

  const updateM = useMutation({
    mutationFn: ({ id, payload }) => updateTreasure(id, payload),
    onSuccess: () => {
      toast({ title: 'Treasure updated', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['treasures'] })
      closeModal()
    },
    onError: (err) => {
      toast({ title: 'Update failed', description: getErrorMessage(err), variant: 'error' })
    },
  })

  const deleteM = useMutation({
    mutationFn: (id) => deleteTreasure(id),
    onSuccess: () => {
      toast({ title: 'Treasure deleted', variant: 'success' })
      qc.invalidateQueries({ queryKey: ['treasures'] })
      closeConfirm()
    },
    onError: (err) => {
      toast({ title: 'Delete failed', description: getErrorMessage(err), variant: 'error' })
      closeConfirm()
    },
  })

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault()

      const photos = String(form.photos || '')
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean)

      const payload = {
        title: form.title,
        price: Number(form.price) || 0,
        category: form.category,
        condition: form.condition,
        brand: form.brand,
        itemModel: form.itemModel,
        type: form.type,
        description: form.description,
        photos,
        location: {
          address: form.address,
          lat: Number(form.lat) || 0,
          lng: Number(form.lng) || 0,
          placeId: form.placeId,
        },
      }

      if (!payload.title || !payload.category) {
        toast({ title: 'Missing fields', description: 'Title and category are required.', variant: 'error' })
        return
      }

      if (editing?._id || editing?.id) {
        const id = editing._id || editing.id
        updateM.mutate({ id, payload })
      } else {
        createM.mutate(payload)
      }
    },
    [createM, editing, form, toast, updateM],
  )

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Treasure',
        cell: (r) => r.title || r.name || r._id || r.id,
      },
      {
        key: 'category',
        header: 'Category',
        cell: (r) => categoryById.get(r.category) || r.category || '—',
      },
      {
        key: 'condition',
        header: 'Condition',
        cell: (r) => r.condition || '—',
      },
      {
        key: 'price',
        header: 'Price',
        cell: (r) => (r.price ?? '—'),
      },
      {
        key: 'postedBy',
        header: 'Posted by',
        cell: (r) => r.postedBy?.name || '—',
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (r) => {
          const id = r._id || r.id
          const isDeleting = deleteM.isPending && confirmState.targetId === id

          return (
            <div className="flex flex-wrap items-center gap-2">
              <Link to={routePaths.treasureDetail(id)} title="View" aria-label="View">
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(r)}
                title="Edit"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                isLoading={isDeleting}
                title="Delete"
                aria-label="Delete"
                onClick={() => {
                  if (!id) return
                  openConfirm({
                    targetId: id,
                    title: 'Delete Treasure?',
                    description: `Are you sure you want to delete "${r.title}"?`,
                    onConfirm: () => deleteM.mutate(id),
                  })
                }}
              >
                {!isDeleting && <Trash className="h-4 w-4" />}
              </Button>
            </div>
          )
        },
      },
    ],
    [categoryById, deleteM, openEdit, confirmState.targetId],
  )

  const onClearSearch = useCallback(() => {
    setSearchDraft('')
    setFilterParam('searchBy', '')
  }, [setFilterParam])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Treasure Management"
        right={
          <div className="flex items-center gap-2">
            <Button onClick={openCreate}>Add Treasure</Button>
          </div>
        }
      />

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="mb-1 text-xs font-medium text-slate-600">Search by name</p>
            <div className="flex gap-2">
              <Input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Gold Necklace"
              />
              <Button variant="ghost" onClick={onClearSearch} disabled={!searchBy}>
                Clear
              </Button>
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="mb-1 text-xs font-medium text-slate-600">Scope</p>
            <Select value={scope} onChange={(val) => setFilterParam('scope', val)}>
              <option value="all">All</option>
              <option value="mine">Mine</option>
            </Select>
          </div>

          <div className="md:col-span-2">
            <p className="mb-1 text-xs font-medium text-slate-600">Condition</p>
            <Select value={condition} onChange={(val) => setFilterParam('condition', val)}>
              <option value="">All</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Good">Good</option>
            </Select>
          </div>

          <div className="md:col-span-3">
            <p className="mb-1 text-xs font-medium text-slate-600">Category</p>
            <Select value={category} onChange={(val) => setFilterParam('category', val)}>
              <option value="">All</option>
              {categoryRows.map((c) => {
                const id = c._id || c.id
                const label = c.name || c.title || id
                if (!id) return null
                return (
                  <option key={id} value={id}>
                    {label}
                  </option>
                )
              })}
            </Select>
            {categoriesQuery.isError ? (
              <p className="mt-1 text-xs text-rose-600">
                Failed to load categories: {getErrorMessage(categoriesQuery.error)}
              </p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <p className="mb-1 text-xs font-medium text-slate-600">Rows</p>
            <div className="w-24">
              <Select value={String(pageSize)} onChange={(val) => setPageSize(Number(val))}>
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
        <TableSkeleton />
      ) : q.isError ? (
        <EmptyState
          title="Failed to load treasures"
          description={getErrorMessage(q.error)}
          action={<Button onClick={() => q.refetch()}>Retry</Button>}
        />
      ) : rows.length ? (
        <Table columns={columns} rows={rows} rowKey={(r) => r._id || r.id} />
      ) : (
        <EmptyState title="No treasures" description="No data returned." />
      )}

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {editing ? 'Edit treasure' : 'Add treasure'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {editing ? 'Update fields and save changes.' : 'Fill the form and create a new treasure.'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  Close
                </Button>
              </div>

              <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={onSubmitForm}>
                <div className="md:col-span-2">
                  <p className="mb-1 text-xs font-medium text-slate-600">Title</p>
                  <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">Category</p>
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="">Select</option>
                    {categoryRows.map((c) => {
                      const id = c._id || c.id
                      const label = c.name || c.title || id
                      if (!id) return null
                      return (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">Condition</p>
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    value={form.condition}
                    onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
                  >
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Good">Good</option>
                  </select>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">Price</p>
                  <Input
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    type="number"
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">Brand</p>
                  <Input value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} />
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">Type</p>
                  <Input value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} />
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">Item model</p>
                  <Input
                    value={form.itemModel}
                    onChange={(e) => setForm((p) => ({ ...p, itemModel: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="mb-1 text-xs font-medium text-slate-600">Address</p>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Clifton, Karachi, Pakistan"
                  />
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">Latitude</p>
                  <Input
                    value={form.lat}
                    onChange={(e) => setForm((p) => ({ ...p, lat: e.target.value }))}
                    type="number"
                  />
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">Longitude</p>
                  <Input
                    value={form.lng}
                    onChange={(e) => setForm((p) => ({ ...p, lng: e.target.value }))}
                    type="number"
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="mb-1 text-xs font-medium text-slate-600">Place ID</p>
                  <Input value={form.placeId} onChange={(e) => setForm((p) => ({ ...p, placeId: e.target.value }))} />
                </div>

                <div className="md:col-span-2">
                  <p className="mb-1 text-xs font-medium text-slate-600">Photos (one per line)</p>
                  <textarea
                    className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    value={form.photos}
                    onChange={(e) => setForm((p) => ({ ...p, photos: e.target.value }))}
                    placeholder="https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <p className="mb-1 text-xs font-medium text-slate-600">Description</p>
                  <textarea
                    className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Beautiful gold necklace in excellent condition."
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2">
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
