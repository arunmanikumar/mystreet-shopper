import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createOrder } from '../services/orderService'
import type { CartLineItem } from '../types/cart'
import type { OrderPaymentMethod } from '../types/order'
import { clearStoredCart, getStoredCart } from '../utils/cartStorage'
import { validateCheckoutSubmission } from './checkoutValidation'

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<CartLineItem[]>(() => getStoredCart())
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>('COD')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const nextCart = getStoredCart()
    setCart(nextCart)

    if (nextCart.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [navigate])

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setApiError(null)

    if (cart.length === 0) {
      navigate('/cart', { replace: true })
      return
    }

    const validationError = validateCheckoutSubmission({
      shippingAddress,
      paymentMethod,
      items: cart,
    })

    if (validationError) {
      setApiError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const order = await createOrder({
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.product.id,
          size: item.size,
          quantity: item.quantity,
        })),
      })

      clearStoredCart()
      setCart([])
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to submit order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/checkout' }} />
  }

  if (cart.length === 0) {
    return null
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Checkout</p>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            Confirm shipping details and place your order.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-stone-600">
            Payment is simulated. Cash on Delivery and Mock Zelle are the available methods.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <form className="space-y-6 rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-800">Shipping address</span>
                <textarea
                  required
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
                  placeholder="Enter the delivery address"
                />
              </label>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-stone-800">Payment method</legend>
              <label className="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <span className="text-sm text-stone-700">Cash on Delivery</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                />
                <span className="text-sm text-stone-700">UPI</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Zelle"
                  checked={paymentMethod === 'Zelle'}
                  onChange={() => setPaymentMethod('Zelle')}
                />
                <span className="text-sm text-stone-700">Mock Zelle</span>
              </label>
            </fieldset>

            {apiError ? (
              <div role="alert" aria-live="assertive" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {apiError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {isSubmitting ? 'Submitting order...' : 'Place order'}
            </button>
          </form>

          <aside className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Order summary</p>
            <div className="mt-4 space-y-4">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex items-start justify-between gap-4 border-b border-stone-200 pb-3 last:border-b-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{item.product.name}</p>
                    <p className="text-sm text-stone-600">Size {item.size} x {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-stone-950">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between text-sm text-stone-600">
                <span>Total</span>
                <span className="text-lg font-semibold text-stone-950">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div className="mt-5">
              <Link
                to="/cart"
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
              >
                Back to cart
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}