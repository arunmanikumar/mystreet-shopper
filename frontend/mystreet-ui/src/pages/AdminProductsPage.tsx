import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { deleteProduct, getProducts } from '../services/productService'
import { ApiServiceError } from '../types/errors'
import type { Product } from '../types/product'

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

export function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const status = searchParams.get('status')

    if (status === 'created') {
      setSuccessMessage('Product created successfully.')
    } else if (status === 'updated') {
      setSuccessMessage('Product updated successfully.')
    }

    if (status) {
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getProducts()

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
  }, [])

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Delete product "${product.name}"? This cannot be undone.`)

    if (!confirmed) {
      return
    }

    setError(null)

    try {
      await deleteProduct(product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setSuccessMessage('Product deleted successfully.')
    } catch (deleteError) {
      const message = deleteError instanceof ApiServiceError ? deleteError.message : 'Unable to delete product.'
      setError(message)
    }
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Admin Products</p>
            <h2 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              Manage catalog products, inventory, and listing details.
            </h2>
          </div>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center justify-center rounded-full border border-stone-950 bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
          >
            Create Product
          </Link>
        </div>

        {successMessage ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-8 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-6">
            <p className="text-sm font-medium text-stone-600">Loading products...</p>
          </div>
        ) : null}

        {!isLoading ? (
          <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-stone-200 bg-white">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Sizes</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Edit</th>
                  <th className="px-4 py-3">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 align-top">
                      <img
                        src={product.imageUrl}
                        alt={`${product.brand} ${product.name}`}
                        className="h-14 w-14 rounded-xl border border-stone-200 object-cover"
                      />
                    </td>
                    <td className="px-4 py-3 align-top font-medium text-stone-900">{product.name}</td>
                    <td className="px-4 py-3 align-top">{product.brand}</td>
                    <td className="px-4 py-3 align-top">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 align-top">{product.sizes.join(', ')}</td>
                    <td className="px-4 py-3 align-top">{product.stockQty}</td>
                    <td className="px-4 py-3 align-top">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
                      >
                        Edit
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        type="button"
                        onClick={() => {
                          void handleDelete(product)
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}