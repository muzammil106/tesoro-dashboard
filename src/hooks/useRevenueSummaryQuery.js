import { useQuery } from '@tanstack/react-query'
import { getRevenueSummary } from '../api/services/transactionService'

export function useRevenueSummaryQuery({ from, to }) {
  return useQuery({
    queryKey: ['revenueSummary', { from, to }],
    queryFn: () => getRevenueSummary({ from, to }),
  })
}
