import type { CartLineItem } from '../types/cart'
import type { OrderPaymentMethod } from '../types/order'

type CheckoutSubmission = {
  shippingAddress: string
  paymentMethod: OrderPaymentMethod
  items: CartLineItem[]
}

const VALID_PAYMENT_METHODS: ReadonlySet<OrderPaymentMethod> = new Set(['COD', 'UPI', 'Zelle'])

export function validateCheckoutSubmission(submission: CheckoutSubmission): string | null {
  if (!submission.shippingAddress.trim()) {
    return 'Shipping address is required.'
  }

  if (!VALID_PAYMENT_METHODS.has(submission.paymentMethod)) {
    return 'Please select a valid payment method.'
  }

  if (submission.items.length === 0) {
    return 'Your cart is empty.'
  }

  for (const item of submission.items) {
    if (!item.size.trim() || item.quantity < 1) {
      return 'Your cart has invalid item quantities or sizes.'
    }
  }

  return null
}