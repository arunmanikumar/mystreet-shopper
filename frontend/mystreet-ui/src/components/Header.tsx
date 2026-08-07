import { Navigation } from './Navigation'

export function Header() {
  return (
    <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              MyStreet Shoppers
            </p>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
                Sneakers for everyday rotation
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                Browse new drops, build a cart, and check out from a clean customer storefront.
              </p>
            </div>
          </div>

          <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
            New arrivals weekly
          </div>
        </div>

        <Navigation />
      </div>
    </header>
  )
}