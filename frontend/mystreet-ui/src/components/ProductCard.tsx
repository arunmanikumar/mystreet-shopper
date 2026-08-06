import { Link } from 'react-router-dom'
import type { Product } from '../types/product'

type ProductCardProps = {
  product: Product
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

function getAvailabilityLabel(stockQty: number) {
  if (stockQty <= 0) {
    return 'Out of stock'
  }

  if (stockQty <= 5) {
    return 'Low stock'
  }

  return 'In stock'
}

export function ProductCard({ product }: ProductCardProps) {
  const availabilityLabel = getAvailabilityLabel(product.stockQty)
  const stockClassName =
    product.stockQty <= 0
      ? 'border-rose-200 bg-rose-50 text-rose-800'
      : product.stockQty <= 5
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-emerald-200 bg-emerald-50 text-emerald-800'

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <Link
        to={`/products/${product.id}`}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div className="aspect-[4/3] overflow-hidden bg-stone-100">
          <img
            src={product.imageUrl}
            alt={`${product.brand} ${product.name}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
            {product.brand}
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-stone-950">
            <Link
              to={`/products/${product.id}`}
              className="rounded-sm outline-none transition hover:text-amber-700 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              {product.name}
            </Link>
          </h3>
          <p className="line-clamp-2 text-sm leading-6 text-stone-600">{product.description}</p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Price</p>
            <p className="mt-1 text-xl font-semibold text-stone-950">{formatPrice(product.price)}</p>
          </div>

          <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${stockClassName}`}>
            {availabilityLabel}
          </div>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="inline-flex items-center justify-center rounded-full border border-stone-950 bg-stone-950 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          View details
        </Link>
      </div>
    </article>
  )
}
