import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrderById } from '../services/orderService'
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

export function OrderDetailsPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const orderId = id?.trim() ?? ''

    if (!orderId) {
      setError('Order id is missing.')
      setIsLoading(false)
      return
    }

    let isMounted = true

    async function loadOrder() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getOrderById(orderId)

        if (isMounted) {
          setOrder(response)
        }
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError instanceof ApiServiceError ? loadError.message : 'Unable to load this order.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrder()

    return () => {
      isMounted = false
    }
  }, [id])

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600">
        <Link to="/orders" className="font-medium text-stone-700 transition hover:text-amber-700">
          Orders
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-stone-500">Order details</span>
      </div>

      <div className="rounded-[2rem] border border-stone-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Order details</p>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            View the order summary, shipping details, and line items.
          </h2>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-6">
            <p className="text-sm font-medium text-stone-600">Loading order details...</p>
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-rose-900">
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : null}

        {!isLoading && !error && order ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Order ID</p>
                  <p className="mt-2 break-all text-sm font-medium text-stone-900">{order.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Date</p>
                  <p className="mt-2 text-sm text-stone-700">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Status</p>
                  <p className="mt-2 text-sm text-stone-700">{order.status}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Payment method</p>
                  <p className="mt-2 text-sm text-stone-700">{order.paymentMethod}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Shipping address</p>
                  <p className="mt-2 text-sm leading-6 text-stone-700">{order.shippingAddress}</p>
                </div>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5 shadow-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Order total</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
                {formatPrice(order.totalAmount)}
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  to="/orders"
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
                >
                  Back to orders
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center rounded-full border border-stone-950 bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
                >
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        ) : null}

        {!isLoading && !error && order ? (
          <div className="mt-8 rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Items</p>
            <div className="mt-4 space-y-4">
              {order.orderItems.map((item) => (
                <article key={item.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-stone-950">{item.productName}</p>
                      <p className="mt-1 text-sm text-stone-600">Size {item.size}</p>
                      <p className="mt-1 text-sm text-stone-600">Quantity {item.quantity}</p>
                    </div>

                    <div className="text-right text-sm text-stone-700">
                      <p>Unit price: {formatPrice(item.price)}</p>
                      <p className="mt-1 font-semibold text-stone-950">Line total: {formatPrice(item.lineTotal)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}