import { memo, useMemo } from 'react'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { MetricCard } from '../../components/ui/MetricCard'
import { Skeleton } from '../../components/loaders/Skeleton'
import { LineChartCard } from '../../components/charts/LineChartCard'
import { getErrorMessage } from '../../utils/httpError'
import { useAnalyticsOverviewQuery } from '../../hooks/useAnalyticsOverviewQuery'

const FALLBACK_GROWTH = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 18 },
  { name: 'Wed', value: 22 },
  { name: 'Thu', value: 16 },
  { name: 'Fri', value: 28 },
  { name: 'Sat', value: 21 },
  { name: 'Sun', value: 31 },
]

export default memo(function AnalyticsPage() {
  const { data, isLoading, isError, error, refetch } = useAnalyticsOverviewQuery()

  const metrics = useMemo(() => {
    const d = data || {}
    return [
      { label: 'Most active users', value: d.activeUsers ?? '—' },
      { label: 'Treasure hotspots', value: d.hotspots ?? '—' },
      { label: 'Community growth', value: d.growth ?? '—' },
    ]
  }, [data])

  const chartData = useMemo(() => data?.growthSeries || FALLBACK_GROWTH, [data])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-44" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        title="Failed to load analytics"
        description={getErrorMessage(error)}
        action={<Button onClick={() => refetch()}>Retry</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics"
        subtitle="Key activity and growth insights"
        right={<Button variant="ghost" onClick={() => refetch()}>Refresh</Button>}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {metrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>
      <LineChartCard title="Community growth" data={chartData} />
    </div>
  )
})
