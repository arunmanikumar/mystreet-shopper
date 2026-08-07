import { describe, expect, it } from 'vitest'
import type { Product } from '../types/product'
import { cartReducer } from './cartReducer'

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Runner',
    brand: 'Nike',
    description: 'Lightweight',
    price: 100,
    imageUrl: 'https://example.com/p.jpg',
    sizes: ['8', '9'],
    stockQty: 2,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('cartReducer', () => {
  it('adds a new item to the cart', () => {
    const product = createProduct()

    const next = cartReducer([], {
      type: 'add',
      payload: { product, size: '8' },
    })

    expect(next).toHaveLength(1)
    expect(next[0].quantity).toBe(1)
    expect(next[0].size).toBe('8')
  })

  it('caps quantity by product stock when adding existing item', () => {
    const product = createProduct({ stockQty: 2 })
    const state = [{ product, size: '8', quantity: 2 }]

    const next = cartReducer(state, {
      type: 'add',
      payload: { product, size: '8' },
    })

    expect(next).toHaveLength(1)
    expect(next[0].quantity).toBe(2)
  })

  it('removes an item when quantity is set to zero', () => {
    const product = createProduct()
    const state = [{ product, size: '9', quantity: 1 }]

    const next = cartReducer(state, {
      type: 'setQuantity',
      payload: { productId: product.id, size: '9', quantity: 0 },
    })

    expect(next).toEqual([])
  })

  it('clears all items', () => {
    const product = createProduct()
    const state = [{ product, size: '8', quantity: 1 }]

    const next = cartReducer(state, { type: 'clear' })

    expect(next).toEqual([])
  })
})