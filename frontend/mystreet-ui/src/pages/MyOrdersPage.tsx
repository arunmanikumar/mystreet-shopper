import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../services/orderService'
import type { Order } from '../types/order'
import { ApiServiceError } from '../types/errors'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

export function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadOrders() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getMyOrders()

        if (isMounted) {
          setOrders(response)
        }
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError instanceof ApiServiceError ? loadError.message : 'Unable to load orders.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Orders</p>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            Review your order history and open any order for full details.
          </h2>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-6">
            <p className="text-sm font-medium text-stone-600">Loading your orders...</p>
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-rose-900">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : null}

        {!isLoading && !error && orders.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
            <p className="text-2xl font-semibold tracking-tight text-stone-950">No orders yet</p>
            <p className="mt-3 text-base leading-7 text-stone-600">
              Once you place an order, it will appear here with its status and payment method.
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full border border-stone-950 bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
              >
                Browse products
              </Link>
            </div>
          </div>
        ) : null}

        {!isLoading && !error && orders.length > 0 ? (
          <div className="mt-8 grid gap-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Order ID</p>
                    <p className="break-all text-sm font-medium text-stone-900">{order.id}</p>
                    <p className="text-sm text-stone-600">Placed {formatDate(order.createdAt)}</p>
                  </div>

                  <div className="grid gap-2 text-sm text-stone-700 sm:grid-cols-2 lg:text-right">
                    <p><span className="font-medium text-stone-900">Status:</span> {order.status}</p>
                    <p><span className="font-medium text-stone-900">Payment:</span> {order.paymentMethod}</p>
                    <p><span className="font-medium text-stone-900">Total:</span> {formatPrice(order.totalAmount)}</p>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-950 bg-stone-950 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
                  >
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}