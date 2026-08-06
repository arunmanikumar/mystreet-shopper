import { describe, expect, it } from 'vitest'
import type { CartLineItem } from '../types/cart'
import type { Product } from '../types/product'
import { validateCheckoutSubmission } from './checkoutValidation'

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p-1',
    name: 'Runner',
    brand: 'Brand',
    description: 'Desc',
    price: 150,
    imageUrl: 'https://example.com/product.jpg',
    sizes: ['9'],
    stockQty: 3,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function createItem(overrides: Partial<CartLineItem> = {}): CartLineItem {
  return {
    product: createProduct(),
    size: '9',
    quantity: 1,
    ...overrides,
  }
}

describe('validateCheckoutSubmission', () => {
  it('returns error when shipping address is missing', () => {
    const message = validateCheckoutSubmission({
      shippingAddress: '   ',
      paymentMethod: 'COD',
      items: [createItem()],
    })

    expect(message).toBe('Shipping address is required.')
  })

  it('returns error when cart is empty', () => {
    const message = validateCheckoutSubmission({
      shippingAddress: '123 Main Street',
      paymentMethod: 'COD',
      items: [],
    })

    expect(message).toBe('Your cart is empty.')
  })

  it('returns error when item payload is invalid', () => {
    const message = validateCheckoutSubmission({
      shippingAddress: '123 Main Street',
      paymentMethod: 'COD',
      items: [createItem({ size: ' ', quantity: 0 })],
    })

    expect(message).toBe('Your cart has invalid item quantities or sizes.')
  })

  it('returns null for valid checkout payload', () => {
    const message = validateCheckoutSubmission({
      shippingAddress: '123 Main Street',
      paymentMethod: 'Zelle',
      items: [createItem()],
    })

    expect(message).toBeNull()
  })
})