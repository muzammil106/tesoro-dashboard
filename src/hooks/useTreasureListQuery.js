import { useQuery } from '@tanstack/react-query'
import { getTreasureList } from '../api/services/treasureService'

export function useTreasureListQuery({
  page,
  pageSize,
  searchBy,
  category,
  condition,
  scope,
} = {}) {
  return useQuery({
    queryKey: ['treasures', { page, pageSize, searchBy, category, condition, scope }],
    queryFn: () => getTreasureList({ page, pageSize, searchBy, category, condition, scope }),
    placeholderData: (prev) => prev,
  })
}
