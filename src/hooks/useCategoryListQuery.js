import { useQuery } from '@tanstack/react-query'
import { getCategoryList } from '../api/services/categoryService'

export function useCategoryListQuery({ page = 1, pageSize = 100, searchBy } = {}) {
  return useQuery({
    queryKey: ['categories', { page, pageSize, searchBy }],
    queryFn: () => getCategoryList({ page, pageSize, searchBy }),
  })
}
