import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const baseLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/cart', label: 'Cart' },
]

export function Navigation() {
  const navigate = useNavigate()
  const { isAdmin, isAuthenticated, logout, user } = useAuth()

  const links = [
    ...baseLinks,
    ...(isAuthenticated ? [{ to: '/orders', label: 'Orders' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
    ...(!isAuthenticated ? [
      { to: '/login', label: 'Login' },
      { to: '/register', label: 'Register' },
    ] : []),
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <nav aria-label="Primary" className="overflow-x-auto">
        <ul className="flex min-w-max gap-2 pb-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  [
                    'inline-flex rounded-full border px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'border-stone-950 bg-stone-950 text-stone-50'
                      : 'border-stone-300 bg-white text-stone-700 hover:border-amber-400 hover:text-stone-950',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-3">
        {user ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900">
            Hi, {user.firstName}
          </span>
        ) : null}

        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => {
              void handleLogout()
            }}
            className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-rose-300 hover:text-rose-700"
          >
            Logout
          </button>
        ) : null}
      </div>
    </div>
  )
}