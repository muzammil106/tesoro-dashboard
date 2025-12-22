import { memo, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'

export const Pagination = memo(function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages

  const rangeText = useMemo(() => {
    const t = Number(total || 0)
    if (!Number.isFinite(t) || t <= 0) return '0 items'
    const start = (page - 1) * pageSize + 1
    const end = Math.min(t, page * pageSize)
    return `${start}-${end} of ${t}`
  }, [page, pageSize, total])

  const goPrev = useCallback(() => {
    if (canPrev) onPageChange(page - 1)
  }, [canPrev, onPageChange, page])

  const goNext = useCallback(() => {
    if (canNext) onPageChange(page + 1)
  }, [canNext, onPageChange, page])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-900">{rangeText}</span>
        <span className="ml-2">•</span>
        <span className="ml-2">
          Page <span className="font-medium text-slate-900">{page}</span> /{' '}
          <span className="font-medium text-slate-900">{totalPages}</span>
        </span>
      </p>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={goPrev} disabled={!canPrev}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <Button variant="ghost" size="sm" onClick={goNext} disabled={!canNext}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
