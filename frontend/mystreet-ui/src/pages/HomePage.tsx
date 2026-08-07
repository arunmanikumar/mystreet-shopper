import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
      <section className="rounded-[2rem] border border-stone-200/80 bg-white/85 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Featured</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          Discover sneakers built for daily wear and standout style.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
          Shop curated collections, review product details, and keep everything in one simple cart
          experience.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-stone-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Style</p>
            <p className="mt-2 text-lg font-medium text-stone-900">Fresh silhouettes</p>
          </div>
          <div className="rounded-2xl bg-stone-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Fit</p>
            <p className="mt-2 text-lg font-medium text-stone-900">Sizes for every run</p>
          </div>
          <div className="rounded-2xl bg-stone-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Speed</p>
            <p className="mt-2 text-lg font-medium text-stone-900">Quick checkout flow</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/products"
            className="inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
          >
            Shop products
          </Link>
          <Link
            to="/cart"
            className="inline-flex rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-amber-500"
          >
            View cart
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Why shop here</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
            <li>Browse styles without distractions.</li>
            <li>Save picks to your cart as you explore.</li>
            <li>Use a simple account flow when you are ready to order.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-stone-950 p-6 text-stone-50 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">Customer tip</p>
          <p className="mt-3 text-sm leading-7 text-stone-200">
            Start with the product catalog, then open the cart whenever you want to compare items or
            move into checkout.
          </p>
        </div>
      </section>
    </div>
  )
}