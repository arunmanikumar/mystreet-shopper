import type { Product } from './product'

export type CartLineItem = {
  product: Product
  size: string
  quantity: number
}