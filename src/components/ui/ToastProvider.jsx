import { useCallback, useMemo, useRef, useState } from 'react'
import { cn } from '../../utils/cn'
import { ToastContext } from './toastContext'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

function ToastIcon({ variant }) {
  switch (variant) {
    case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    case 'error': return <XCircle className="h-5 w-5 text-rose-500" />
    case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
    case 'info':
    default: return <Info className="h-5 w-5 text-sky-500" />
  }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, variant = 'info', duration = 4000 }) => {
      const id = ++idRef.current
      const next = { id, title, description, variant }
      setToasts((prev) => [next, ...prev])

      if (duration) {
        window.setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast, dismiss }), [dismiss, toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm animate-in slide-in-from-right-full fade-in items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-xl ring-1 ring-black/5"
            role="alert"
          >
            <div className="flex-shrink-0 pt-0.5">
              <ToastIcon variant={t.variant} />
            </div>
            <div className="min-w-0 flex-1">
              {t.title && <p className="text-sm font-semibold text-slate-900">{t.title}</p>}
              {t.description && <p className="mt-1 text-sm text-slate-500">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
