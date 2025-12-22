import { useQuery } from '@tanstack/react-query'
import { getAnalyticsOverview } from '../api/services/analyticsService'

export function useAnalyticsOverviewQuery() {
  return useQuery({
    queryKey: ['analyticsOverview'],
    queryFn: () => getAnalyticsOverview(),
  })
}
