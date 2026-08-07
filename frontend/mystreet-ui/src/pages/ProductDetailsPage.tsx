import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProductById } from '../services/productService'
import { ApiServiceError } from '../types/errors'
import type { Product } from '../types/product'
import { addProductToCart } from '../utils/cartStorage'

const placeholderImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"%3E%3Crect width="640" height="640" fill="%23e7e5e4"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2357554e" font-family="Segoe UI, sans-serif" font-size="28"%3EImage not available%3C/text%3E%3C/svg%3E'

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

function getStockLabel(stockQty: number) {
  if (stockQty <= 0) {
    return 'Out of stock'
  }

  if (stockQty <= 5) {
    return 'Low stock'
  }

  return 'In stock'
}

export function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNotFound, setIsNotFound] = useState(false)

  useEffect(() => {
    const productId = id?.trim() ?? ''

    if (!productId) {
      setIsLoading(false)
      setIsNotFound(true)
      setError(null)
      setProduct(null)
      setSelectedSize('')
      return
    }

    let isMounted = true

    async function loadProduct() {
      setIsLoading(true)
      setError(null)
      setIsNotFound(false)
      setSelectedSize('')

      try {
        const response = await getProductById(productId)

        if (!isMounted) {
          return
        }

        setProduct(response)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        if (loadError instanceof ApiServiceError && loadError.statusCode === 404) {
          setIsNotFound(true)
          setProduct(null)
        } else {
          const message = loadError instanceof ApiServiceError ? loadError.message : 'Unable to load product details.'
          setError(message)
          setProduct(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProduct()

    return () => {
      isMounted = false
    }
  }, [id])

  const stockLabel = useMemo(() => (product ? getStockLabel(product.stockQty) : ''), [product])
  const canAddToCart = Boolean(product && product.stockQty > 0 && selectedSize)

  const handleAddToCart = () => {
    if (!product || !selectedSize) {
      return
    }

    addProductToCart(product, selectedSize)
    void navigate('/cart')
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600">
        <Link to="/products" className="font-medium text-stone-700 transition hover:text-amber-700">
          Products
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-stone-500">Product details</span>
      </div>

      {isLoading ? (
        <div className="rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-stone-600">Loading product details...</p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-900 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em]">Product error</p>
          <p className="mt-3 text-sm leading-6">{error}</p>
          <div className="mt-5">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full border border-rose-900 bg-rose-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800"
            >
              Back to products
            </Link>
          </div>
        </div>
      ) : null}

      {!isLoading && !error && isNotFound ? (
        <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/85 p-8 shadow-sm sm:p-12">
          <p className="text-2xl font-semibold tracking-tight text-stone-950">Product not found</p>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
            The product you tried to open no longer exists or the link is invalid.
          </p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-full border border-stone-950 bg-stone-950 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
            >
              Browse products
            </Link>
          </div>
        </div>
      ) : null}

      {!isLoading && !error && product ? (
        <div className="grid gap-8 rounded-[2rem] border border-stone-200/80 bg-white/90 p-6 shadow-sm lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
          <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-stone-100">
            <img
              src={product.imageUrl}
              alt={`${product.brand} ${product.name}`}
              className="aspect-square w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = placeholderImage
              }}
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                {product.brand}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                {product.name}
              </h2>
              <p className="text-base leading-7 text-stone-600">{product.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Price</p>
                <p className="mt-2 text-2xl font-semibold text-stone-950">{formatPrice(product.price)}</p>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Stock</p>
                <p className="mt-2 text-2xl font-semibold text-stone-950">{product.stockQty}</p>
                <p className="mt-1 text-sm text-stone-600">{stockLabel}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                Available sizes
              </p>
              <div className="flex flex-wrap gap-3">
                {product.sizes.length > 0 ? (
                  product.sizes.map((size) => {
                    const isSelected = selectedSize === size

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={[
                          'min-w-14 rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                          isSelected
                            ? 'border-stone-950 bg-stone-950 text-stone-50'
                            : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:text-stone-950',
                        ].join(' ')}
                        aria-pressed={isSelected}
                      >
                        {size}
                      </button>
                    )
                  })
                ) : (
                  <p className="text-sm text-stone-600">No sizes listed for this product.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={!canAddToCart}
                onClick={handleAddToCart}
                className="inline-flex items-center justify-center rounded-full border border-stone-950 bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-500"
              >
                Add to Cart
              </button>
              <p className="text-sm text-stone-500">
                {product.stockQty <= 0
                  ? 'This product cannot be added because it is out of stock.'
                  : selectedSize
                    ? `Selected size ${selectedSize}.`
                    : 'Select a size to continue.'}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
