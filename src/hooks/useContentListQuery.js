import { useQuery } from '@tanstack/react-query'
import { getContentList } from '../api/services/contentService'

export function useContentListQuery({ page, pageSize } = {}) {
  return useQuery({
    queryKey: ['contents', { page, pageSize }],
    queryFn: () => getContentList({ page, pageSize }),
    placeholderData: (prev) => prev,
  })
}
