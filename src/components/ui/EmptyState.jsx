import { memo } from 'react'
import { cn } from '../../utils/cn'

export const EmptyState = memo(function EmptyState({
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center',
        className,
      )}
    >
      <div className="mx-auto max-w-md">
        <p className="text-base font-semibold text-slate-900">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  )
})
