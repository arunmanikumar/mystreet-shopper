import { StatusCard } from '../components/StatusCard'
import { useBackendStatus } from '../hooks/useBackendStatus'

export function HomePage() {
  const { data, error, isLoading } = useBackendStatus()

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
      <section className="rounded-[2rem] border border-stone-200/80 bg-white/85 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Home</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          Frontend shell is ready for the storefront flows.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
          This home page verifies the backend connection through the shared Axios client and gives
          the app a routed layout you can extend with auth, catalog, checkout, and admin features.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-stone-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Router</p>
            <p className="mt-2 text-lg font-medium text-stone-900">createBrowserRouter</p>
          </div>
          <div className="rounded-2xl bg-stone-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">HTTP</p>
            <p className="mt-2 text-lg font-medium text-stone-900">Reusable Axios client</p>
          </div>
          <div className="rounded-2xl bg-stone-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Styling</p>
            <p className="mt-2 text-lg font-medium text-stone-900">Responsive Tailwind layout</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {isLoading ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-stone-600">Loading backend status...</p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.25em]">Backend error</p>
            <p className="mt-2 text-sm leading-6">{error}</p>
          </div>
        ) : null}

        {data ? <StatusCard status={data} /> : null}
      </section>
    </div>
  )
}