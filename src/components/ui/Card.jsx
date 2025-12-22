import { cn } from '../../utils/cn'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-soft',
        className,
      )}
      {...props}
    />
  )
}
