import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CartLineItem } from '../types/cart'
import { getStoredCart, removeCartLineItem, updateCartLineItemQuantity } from '../utils/cartStorage'

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

export function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartLineItem[]>(() => getStoredCart())

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  )

  const handleIncrease = (item: CartLineItem) => {
    if (item.quantity >= item.product.stockQty) {
      return
    }

    setCart(updateCartLineItemQuantity(item.product.id, item.size, item.quantity + 1))
  }

  const handleDecrease = (item: CartLineItem) => {
    if (item.quantity <= 1) {
      return
    }

    setCart(updateCartLineItemQuantity(item.product.id, item.size, item.quantity - 1))
  }

  const handleRemove = (item: CartLineItem) => {
    setCart(removeCartLineItem(item.product.id, item.size))
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      return
    }

    navigate('/checkout')
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Cart</p>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            Review your selected sizes, adjust quantities, and move to checkout.
          </h2>
        </div>

        {cart.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
            <p className="text-2xl font-semibold tracking-tight text-stone-950">Your cart is empty</p>
            <p className="mt-3 text-base leading-7 text-stone-600">
              Add a product from the catalog to see it here with size, quantity, and subtotal details.
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
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              {cart.map((item) => {
                const itemTotal = item.product.price * item.quantity
                const canIncrease = item.quantity < item.product.stockQty

                return (
                  <article
                    key={`${item.product.id}-${item.size}`}
                    className="grid gap-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[140px_1fr]"
                  >
                    <div className="overflow-hidden rounded-[1.25rem] border border-stone-200 bg-stone-100">
                      <img
                        src={item.product.imageUrl}
                        alt={`${item.product.brand} ${item.product.name}`}
                        className="aspect-square h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">
                            {item.product.brand}
                          </p>
                          <h3 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">
                            {item.product.name}
                          </h3>
                          <p className="mt-1 text-sm text-stone-600">Selected size {item.size}</p>
                        </div>

                        <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">
                          {formatPrice(item.product.price)} each
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-stone-300 bg-stone-50 p-1">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item)}
                            disabled={item.quantity <= 1}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-lg font-semibold text-stone-700 transition hover:bg-white disabled:cursor-not-allowed disabled:text-stone-400"
                            aria-label={`Decrease quantity for ${item.product.name} size ${item.size}`}
                          >
                            -
                          </button>
                          <span className="min-w-10 px-3 text-center text-sm font-semibold text-stone-950">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrease(item)}
                            disabled={!canIncrease}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-lg font-semibold text-stone-700 transition hover:bg-white disabled:cursor-not-allowed disabled:text-stone-400"
                            aria-label={`Increase quantity for ${item.product.name} size ${item.size}`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-800 transition hover:border-rose-300 hover:bg-rose-100"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                        <p className="text-sm font-medium text-stone-500">Item total</p>
                        <p className="text-lg font-semibold text-stone-950">{formatPrice(itemTotal)}</p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <aside className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5 shadow-sm sm:p-6 lg:sticky lg:top-6 lg:self-start">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Summary</p>
              <div className="mt-4 space-y-3 border-b border-stone-200 pb-4">
                <div className="flex items-center justify-between text-sm text-stone-600">
                  <span>Items</span>
                  <span>{cart.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="inline-flex items-center justify-center rounded-full border border-stone-950 bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-500"
                >
                  Checkout
                </button>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
                >
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}