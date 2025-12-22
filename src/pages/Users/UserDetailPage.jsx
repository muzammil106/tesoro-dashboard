import { memo, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/loaders/Skeleton'
import { getErrorMessage } from '../../utils/httpError'
import { blockUser, deleteUser, getUserDetail } from '../../api/services/userService'

export default memo(function UserDetailPage() {
  const { id } = useParams()
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserDetail(id),
    enabled: Boolean(id),
  })

  const block = useMutation({
    mutationFn: () => blockUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', id] }),
  })

  const remove = useMutation({
    mutationFn: ({ userId, password }) => deleteUser({ userId, password }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  const pretty = useMemo(() => JSON.stringify(q.data || {}, null, 2), [q.data])

  const onBlock = useCallback(() => block.mutate(), [block])
  const onDelete = useCallback(() => {
    const ok = window.confirm('Delete this user?')
    if (!ok) return

    const password = window.prompt('Enter your password to confirm delete:') || ''
    if (!password) return

    remove.mutate({ userId: id, password })
  }, [id, remove])

  if (q.isLoading) return <Skeleton className="h-72" />

  if (q.isError) {
    return (
      <EmptyState
        title="Failed to load user"
        description={getErrorMessage(q.error)}
        action={<Button onClick={() => q.refetch()}>Retry</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">User profile</p>
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" isLoading={remove.isPending} onClick={onDelete}>
              Delete
            </Button>
            <Button size="sm" isLoading={block.isPending} onClick={onBlock}>
              Block
            </Button>
          </div>
        </div>
        <pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
          {pretty}
        </pre>
      </Card>
      {(block.isError || remove.isError) && (
        <EmptyState
          title="Action failed"
          description={getErrorMessage(block.error || remove.error)}
        />
      )}
    </div>
  )
})
