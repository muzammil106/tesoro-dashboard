import { forwardRef, memo } from 'react'
import { cn } from '../../utils/cn'

function InputBase({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100',
        className,
      )}
      {...props}
    />
  )
}

export const Input = memo(forwardRef(InputBase))
