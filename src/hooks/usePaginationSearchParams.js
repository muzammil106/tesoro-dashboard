import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 15

export function usePaginationSearchParams() {
  const [sp, setSp] = useSearchParams()

  const page = useMemo(() => {
    const p = Number(sp.get('page') || DEFAULT_PAGE)
    return Number.isFinite(p) && p > 0 ? p : DEFAULT_PAGE
  }, [sp])

  const pageSize = useMemo(() => {
    const s = Number(sp.get('pageSize') || DEFAULT_PAGE_SIZE)
    return Number.isFinite(s) && s > 0 ? s : DEFAULT_PAGE_SIZE
  }, [sp])

  const setPage = useCallback(
    (nextPage) => {
      const next = new URLSearchParams(sp)
      next.set('page', String(nextPage))
      next.set('pageSize', String(pageSize))
      setSp(next)
    },
    [pageSize, setSp, sp],
  )

  const setPageSize = useCallback(
    (nextPageSize) => {
      const size = Number(nextPageSize)
      const safe = Number.isFinite(size) && size > 0 ? size : DEFAULT_PAGE_SIZE

      const next = new URLSearchParams(sp)
      next.set('page', '1')
      next.set('pageSize', String(safe))
      setSp(next)
    },
    [setSp, sp],
  )

  return { page, pageSize, setPage, setPageSize }
}
