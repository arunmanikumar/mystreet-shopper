import type { CartLineItem } from '../types/cart'
import type { Product } from '../types/product'

type AddAction = {
  type: 'add'
  payload: {
    product: Product
    size: string
  }
}

type SetQuantityAction = {
  type: 'setQuantity'
  payload: {
    productId: string
    size: string
    quantity: number
  }
}

type RemoveAction = {
  type: 'remove'
  payload: {
    productId: string
    size: string
  }
}

type ClearAction = {
  type: 'clear'
}

export type CartAction = AddAction | SetQuantityAction | RemoveAction | ClearAction

function normalizeQuantity(quantity: number, stockQty: number) {
  const safeQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 1
  const minQuantity = Math.max(safeQuantity, 1)

  if (stockQty > 0) {
    return Math.min(minQuantity, stockQty)
  }

  return minQuantity
}

export function cartReducer(state: CartLineItem[], action: CartAction): CartLineItem[] {
  switch (action.type) {
    case 'add': {
      const { product, size } = action.payload
      const existing = state.find((item) => item.product.id === product.id && item.size === size)

      if (existing) {
        return state.map((item) => {
          if (item.product.id !== product.id || item.size !== size) {
            return item
          }

          return {
            ...item,
            quantity: normalizeQuantity(item.quantity + 1, product.stockQty),
          }
        })
      }

      return [...state, { product, size, quantity: normalizeQuantity(1, product.stockQty) }]
    }
    case 'setQuantity': {
      const { productId, size, quantity } = action.payload

      return state
        .map((item) => {
          if (item.product.id !== productId || item.size !== size) {
            return item
          }

          if (quantity <= 0) {
            return null
          }

          return {
            ...item,
            quantity: normalizeQuantity(quantity, item.product.stockQty),
          }
        })
        .filter((item): item is CartLineItem => item !== null)
    }
    case 'remove': {
      const { productId, size } = action.payload
      return state.filter((item) => item.product.id !== productId || item.size !== size)
    }
    case 'clear':
      return []
    default:
      return state
  }
}