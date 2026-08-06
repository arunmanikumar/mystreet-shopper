import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-3xl rounded-[2rem] border border-stone-200 bg-white/95 p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Not found</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
        This page does not exist.
      </h2>
      <p className="mt-4 text-base leading-7 text-stone-700">
        The URL might be outdated or mistyped. You can return to the homepage or browse products.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/"
          className="inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
        >
          Back to home
        </Link>
        <Link
          to="/products"
          className="inline-flex rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-amber-500"
        >
          Browse products
        </Link>
      </div>
    </section>
  )
}
