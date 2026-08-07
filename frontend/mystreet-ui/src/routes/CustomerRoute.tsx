import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function CustomerRoute() {
  const { isAdmin } = useAuth()

  if (isAdmin) {
    return <Navigate to="/admin/products" replace />
  }

  return <Outlet />
}