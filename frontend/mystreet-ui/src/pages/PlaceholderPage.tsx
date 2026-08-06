import { Link, useLocation, useParams } from 'react-router-dom'

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const location = useLocation()
  const params = useParams()
  const paramEntries = Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]))

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Placeholder</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">{title}</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">{description}</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl bg-stone-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Route</p>
          <p className="mt-2 break-all text-sm font-medium text-stone-900">{location.pathname}</p>
        </div>

        <div className="rounded-2xl bg-stone-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Parameters</p>
          {paramEntries.length > 0 ? (
            <ul className="mt-2 space-y-2 text-sm text-stone-700">
              {paramEntries.map(([key, value]) => (
                <li key={key}>
                  <span className="font-medium text-stone-900">{key}:</span> {value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-stone-600">No route parameters for this page.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex rounded-full border border-stone-950 bg-stone-950 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
        >
          Back to home
        </Link>
      </div>
    </section>
  )
}