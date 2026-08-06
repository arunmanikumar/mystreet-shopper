import { Outlet } from 'react-router-dom'
import { Header } from '../components/Header'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f9f5ec_0%,_#f3ece0_34%,_#efe6d8_100%)] text-stone-900">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}