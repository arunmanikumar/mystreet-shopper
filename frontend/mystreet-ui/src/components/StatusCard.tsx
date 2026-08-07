import type { BackendStatus } from '../types/backend'
import { formatUtcTimestamp } from '../utils/formatUtcTimestamp'

type StatusCardProps = {
  status: BackendStatus
}

export function StatusCard({ status }: StatusCardProps) {
  const items = [
    { label: 'New drops', value: status.application },
    { label: 'Shopping flow', value: status.status },
    { label: 'Experience', value: status.framework },
    { label: 'Updated', value: formatUtcTimestamp(status.utcTimestamp) },
  ]

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
            Store highlights
          </p>
          <h2 className="mt-2 text-xl font-semibold text-stone-950">Fresh reasons to shop now</h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          Featured
        </span>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-stone-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {item.label}
            </dt>
            <dd className="mt-2 text-base font-medium text-stone-900">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}