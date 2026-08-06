import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const redirectTarget = `${location.pathname}${location.search}${location.hash}`

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: redirectTarget }} />
  }

  return <Outlet />
}