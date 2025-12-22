import { cn } from '../../utils/cn'

export function ShimmerBlock({ className }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-slate-200/70',
        "before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent before:animate-[shimmer_1.6s_infinite]",
        className,
      )}
    />
  )
}
