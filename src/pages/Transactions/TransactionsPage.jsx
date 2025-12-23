import { memo, useCallback, useMemo } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { Table } from '../../components/tables/Table'
import { TableSkeleton } from '../../components/tables/TableSkeleton'
import { Pagination } from '../../components/tables/Pagination'
import { getErrorMessage } from '../../utils/httpError'
import { getItems, getTotal } from '../../utils/paginated'
import { usePaginationSearchParams } from '../../hooks/usePaginationSearchParams'
import { useTipListQuery } from '../../hooks/useTipListQuery'

export default memo(function TransactionsPage() {
  const { page, pageSize, setPage, setPageSize } = usePaginationSearchParams()

  const q = useTipListQuery({ page, pageSize })

  const rows = useMemo(() => getItems(q.data), [q.data])
  const total = useMemo(() => getTotal(q.data), [q.data])
  const onPageChange = useCallback((p) => setPage(p), [setPage])

  const columns = useMemo(
    () => [
      {
        key: 'treasure',
        header: 'Treasure',
        cell: (r) => r.treasure?.title || r.treasure?._id || '—',
      },
      { key: 'amount', header: 'Amount', cell: (r) => r.amount ?? '—' },
      {
        key: 'givenUser',
        header: 'Given by',
        cell: (r) => r.givenUser?.name || r.givenUser?.email || '—',
      },
      {
        key: 'receivedUser',
        header: 'Received by',
        cell: (r) => r.receivedUser?.name || r.receivedUser?.email || '—',
      },
      { key: 'createdAt', header: 'Created', cell: (r) => r.createdAt || '—' },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tips"
        subtitle="Server-side pagination"
        right={<Button variant="ghost" onClick={() => q.refetch()}>Refresh</Button>}
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
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
        <TableSkeleton cols={5} />
      ) : q.isError ? (
        <EmptyState
          title="Failed to load tips"
          description={getErrorMessage(q.error)}
          action={<Button onClick={() => q.refetch()}>Retry</Button>}
        />
      ) : rows.length ? (
        <Table columns={columns} rows={rows} rowKey={(r) => r._id || r.id} />
      ) : (
        <EmptyState title="No tips" description="No data returned." />
      )}

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </div>
  )
})
