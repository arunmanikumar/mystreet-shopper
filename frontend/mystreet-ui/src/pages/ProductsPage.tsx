import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProductGrid } from '../components/ProductGrid'
import { getProducts } from '../services/productService'
import { ApiServiceError } from '../types/errors'
import type { Product } from '../types/product'

function normalizeFilterValue(value: string | null) {
  return value?.trim() ?? ''
}

function uniqueSortedValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((left, right) =>
    left.localeCompare(right),
  )
}

function buildFilterState(searchParams: URLSearchParams) {
  return {
    search: normalizeFilterValue(searchParams.get('search')),
    brand: normalizeFilterValue(searchParams.get('brand')),
    size: normalizeFilterValue(searchParams.get('size')),
  }
}

function formatProductCount(count: number) {
  return new Intl.NumberFormat('en-US').format(count)
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => buildFilterState(searchParams), [searchParams])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allProductsError, setAllProductsError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadAllProducts() {
      try {
        const response = await getProducts()

        if (!isMounted) {
          return
        }

        setAllProducts(response)
        setAllProductsError(null)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        const message = loadError instanceof ApiServiceError ? loadError.message : 'Unable to load filter options.'
        setAllProductsError(message)
      }
    }

    void loadAllProducts()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getProducts(filters)

        if (!isMounted) {
          return
        }

        setProducts(response)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        const message = loadError instanceof ApiServiceError ? loadError.message : 'Unable to load products.'
        setError(message)
        setProducts([])
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      isMounted = false
    }
  }, [filters])

  const brandOptions = useMemo(() => uniqueSortedValues(allProducts.map((product) => product.brand)), [allProducts])
  const sizeOptions = useMemo(
    () => uniqueSortedValues(allProducts.flatMap((product) => product.sizes)),
    [allProducts],
  )

  const hasActiveFilters = Boolean(filters.search || filters.brand || filters.size)

  const updateFilters = (nextFilters: Record<string, string>) => {
    const nextParams = new URLSearchParams()

    Object.entries(nextFilters).forEach(([key, value]) => {
      const trimmedValue = value.trim()

      if (trimmedValue) {
        nextParams.set(key, trimmedValue)
      }
    })

    setSearchParams(nextParams, { replace: true })
  }

  const clearFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const showFilterLoadWarning = Boolean(allProductsError && !brandOptions.length && !sizeOptions.length)

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Products</p>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            Browse the sneaker catalog with fast filters and clean product cards.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-stone-600">
            Search by name or description, narrow by brand and size, and open any card for the full product detail view.
          </p>
        </div>

        <form
          className="mt-8 grid gap-4 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_auto] xl:items-end"
          onSubmit={(event) => {
            event.preventDefault()
            updateFilters(filters)
          }}
        >
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">Search</span>
            <input
              type="search"
              value={filters.search}
              onChange={(event) => updateFilters({ ...filters, search: event.target.value })}
              placeholder="Search products"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">Brand</span>
            <select
              value={filters.brand}
              onChange={(event) => updateFilters({ ...filters, brand: event.target.value })}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            >
              <option value="">All brands</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">Size</span>
            <select
              value={filters.size}
              onChange={(event) => updateFilters({ ...filters, size: event.target.value })}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            >
              <option value="">All sizes</option>
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear filters
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-stone-950 bg-stone-950 px-4 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
            >
              Apply filters
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-stone-600">Loading products...</p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-900 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em]">Catalog error</p>
          <p className="mt-3 text-sm leading-6">{error}</p>
        </div>
      ) : null}

      {showFilterLoadWarning ? (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm sm:p-8">
          <p className="text-sm leading-6">{allProductsError}</p>
        </div>
      ) : null}

      {!isLoading && !error && products.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-600">
              Showing <span className="font-semibold text-stone-950">{formatProductCount(products.length)}</span> products
            </p>
            {hasActiveFilters ? (
              <p className="text-sm text-stone-500">Filtered by query, brand, and size.</p>
            ) : null}
          </div>
          <ProductGrid products={products} />
        </div>
      ) : null}

      {!isLoading && !error && products.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/80 p-8 text-center shadow-sm sm:p-12">
          <p className="text-xl font-semibold tracking-tight text-stone-950">No products matched your filters.</p>
          <p className="mt-3 text-base leading-7 text-stone-600">
            Try removing one of the filters or clearing the search term to expand the results.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center rounded-full border border-stone-950 bg-stone-950 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
            >
              Clear filters
            </button>
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
            >
              Reset catalog view
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  )
}
