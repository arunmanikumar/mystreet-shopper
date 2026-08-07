import type { CartLineItem } from '../types/cart'
import type { Product } from '../types/product'

export const CART_STORAGE_KEY = 'mystreet_cart'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function safeGetItem(key: string) {
  if (!canUseStorage()) {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string) {
  if (!canUseStorage()) {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore storage write failures (privacy mode, quota, or restricted environments).
  }
}

function safeRemoveItem(key: string) {
  if (!canUseStorage()) {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore storage remove failures.
  }
}

function readStoredCart(): CartLineItem[] {
  const value = safeGetItem(CART_STORAGE_KEY)

  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value) as CartLineItem[]

    if (!Array.isArray(parsed)) {
      safeRemoveItem(CART_STORAGE_KEY)
      return []
    }

    const sanitized = parsed.filter((item) => {
      return Boolean(
        item &&
          item.product &&
          typeof item.product.id === 'string' &&
          typeof item.product.name === 'string' &&
          typeof item.product.price === 'number' &&
          typeof item.product.stockQty === 'number' &&
          typeof item.size === 'string' &&
          typeof item.quantity === 'number' &&
          item.quantity > 0,
      )
    })

    if (sanitized.length !== parsed.length) {
      safeSetItem(CART_STORAGE_KEY, JSON.stringify(sanitized))
    }

    return sanitized
  } catch {
    safeRemoveItem(CART_STORAGE_KEY)
    return []
  }
}

function writeStoredCart(cart: CartLineItem[]) {
  safeSetItem(CART_STORAGE_KEY, JSON.stringify(cart))
}

function normalizeQuantity(quantity: number, stockQty: number) {
  if (!Number.isFinite(quantity)) {
    return 1
  }

  const rounded = Math.floor(quantity)

  if (stockQty > 0) {
    return Math.min(Math.max(rounded, 1), stockQty)
  }

  return Math.max(rounded, 1)
}

export function getStoredCart() {
  return readStoredCart()
}

export function setStoredCart(cart: CartLineItem[]) {
  writeStoredCart(cart)
}

export function clearStoredCart() {
  safeRemoveItem(CART_STORAGE_KEY)
}

export function addProductToCart(product: Product, size: string) {
  const cart = readStoredCart()
  const existingItem = cart.find((item) => item.product.id === product.id && item.size === size)

  if (existingItem) {
    const nextCart = cart.map((item) =>
      item.product.id === product.id && item.size === size
        ? { ...item, quantity: normalizeQuantity(item.quantity + 1, product.stockQty) }
        : item,
    )

    writeStoredCart(nextCart)
    return nextCart
  }

  const nextCart = [...cart, { product, size, quantity: normalizeQuantity(1, product.stockQty) }]
  writeStoredCart(nextCart)
  return nextCart
}

export function updateCartLineItemQuantity(productId: string, size: string, quantity: number) {
  const cart = readStoredCart()

  const nextCart = cart
    .map((item) => {
      if (item.product.id !== productId || item.size !== size) {
        return item
      }

      return {
        ...item,
        quantity: normalizeQuantity(quantity, item.product.stockQty),
      }
    })
    .filter((item) => item.quantity > 0)

  writeStoredCart(nextCart)
  return nextCart
}

export function removeCartLineItem(productId: string, size: string) {
  const nextCart = readStoredCart().filter((item) => item.product.id !== productId || item.size !== size)
  writeStoredCart(nextCart)
  return nextCart
}