import { forwardRef, memo } from 'react'
import { cn } from '../../utils/cn'

function ButtonBase(
  { className, variant = 'primary', size = 'md', isLoading, ...props },
  ref,
) {
  const variants = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-900',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700',
  }

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  }

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : null}
      {props.children}
    </button>
  )
}

export const Button = memo(forwardRef(ButtonBase))
