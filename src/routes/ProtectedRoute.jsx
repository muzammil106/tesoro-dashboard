import { memo } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { clearAuthToken, isAdminAuthed, isAuthed } from '../utils/authToken'
import { routePaths } from './routePaths'

export const ProtectedRoute = memo(function ProtectedRoute() {
  const location = useLocation()
  const from = location.pathname + location.search

  if (!isAuthed()) {
    return <Navigate to={routePaths.login} replace state={{ from }} />
  }

  if (!isAdminAuthed()) {
    clearAuthToken()
    return (
      <Navigate
        to={routePaths.login}
        replace
        state={{
          from,
          error: 'Only admins can access this portal.',
        }}
      />
    )
  }

  return <Outlet />
})
