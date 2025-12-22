import { Skeleton } from './Skeleton'

export function PageLoader() {
  return (
    <div className="min-h-[60vh] w-full p-6">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-72" />
      </div>
    </div>
  )
}
