import { useQuery } from '@tanstack/react-query'
import { getUserList } from '../api/services/userService'

export function useUserListQuery({ page, pageSize, search, isPremium }) {
  return useQuery({
    queryKey: ['users', { page, pageSize, search, isPremium }],
    queryFn: () => getUserList({ page, pageSize, search, isPremium }),
    placeholderData: (prev) => prev,
  })
}
