import { memo, useCallback, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { getMe } from '../api/services/authService'
import { clearAuthToken, getAuthName, setAuthName } from '../utils/authToken'
import { Button } from '../components/ui/Button'
import { routePaths } from '../routes/routePaths'

import logo from '../assets/logo.png'

function pickName(data) {
  return data?.name || data?.user?.name || data?.data?.name || data?.data?.user?.name || ''
}

export const Topbar = memo(function Topbar({ onMenuClick }) {
  const navigate = useNavigate()

  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => getMe(),
    retry: 0,
  })

  const displayName = useMemo(() => {
    const fromApi = pickName(me.data)
    return fromApi || getAuthName() || 'Admin'
  }, [me.data])

  useEffect(() => {
    const fromApi = pickName(me.data)
    if (fromApi) setAuthName(fromApi)
  }, [me.data])

  const onLogout = useCallback(() => {
    clearAuthToken()
    navigate(routePaths.login, { replace: true })
  }, [navigate])

  return (
    <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="mr-2 text-slate-500 hover:text-slate-700 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <img src={logo} alt="Tesoro Logo" className="h-8 w-auto object-contain" />
        <span className="hidden text-xs text-slate-500 md:inline">{displayName}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={onLogout}>
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  )
})
