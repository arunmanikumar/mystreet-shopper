import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AdminRoute() {
  const { isAdmin, isAuthenticated } = useAuth()
  const location = useLocation()
  const redirectTarget = `${location.pathname}${location.search}${location.hash}`

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: redirectTarget }} />
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}