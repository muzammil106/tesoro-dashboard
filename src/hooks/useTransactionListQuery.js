import { useQuery } from '@tanstack/react-query'
import { getTransactionList } from '../api/services/transactionService'

export function useTransactionListQuery({ page, pageSize, from, to }) {
  return useQuery({
    queryKey: ['transactions', { page, pageSize, from, to }],
    queryFn: () => getTransactionList({ page, pageSize, from, to }),
    placeholderData: (prev) => prev,
  })
}
