import { useQuery } from '@tanstack/react-query'
import { getTipList } from '../api/services/tipService'

export function useTipListQuery({ page, pageSize } = {}) {
  return useQuery({
    queryKey: ['tips', { page, pageSize }],
    queryFn: () => getTipList({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}
