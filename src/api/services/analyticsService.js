const STATIC_ANALYTICS_OVERVIEW = {
  activeUsers: 128,
  hotspots: 12,
  growth: 34,
  growthSeries: [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 18 },
    { name: 'Wed', value: 22 },
    { name: 'Thu', value: 16 },
    { name: 'Fri', value: 28 },
    { name: 'Sat', value: 21 },
    { name: 'Sun', value: 31 },
  ],
}

export async function getAnalyticsOverview() {
  // Temporary: allow the Analytics screen to render even if the backend endpoint isn't ready.
  return STATIC_ANALYTICS_OVERVIEW
}
