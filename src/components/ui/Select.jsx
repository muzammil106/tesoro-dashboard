import { Children, isValidElement, memo, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useClickOutside } from '../../hooks/useClickOutside'

function SelectBase({ className, value, onChange, children, placeholder = 'Select...', disabled }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setIsOpen(false))

  // Extract options from props.children
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => ({
      value: child.props.value,
      label: child.props.children,
    }))

  const selectedOption = options.find((o) => String(o.value) === String(value))

  const handleSelect = (val) => {
    if (disabled) return
    onChange(val)
    setIsOpen(false)
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:opacity-50',
          isOpen ? 'border-sky-500 ring-4 ring-sky-500/10' : ''
        )}
      >
        <span className={cn('block truncate', !selectedOption && 'text-slate-500')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-100 bg-white p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          {options.length > 0 ? (
            options.map((opt) => {
              const check = String(opt.value) === String(value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors',
                    check ? 'bg-sky-50 text-sky-900 font-medium' : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {check && <Check className="h-3.5 w-3.5 text-sky-500" />}
                </button>
              )
            })
          ) : (
            <div className="px-2 py-2 text-sm text-slate-400">No options</div>
          )}
        </div>
      )}
    </div>
  )
}

export const Select = memo(SelectBase)
