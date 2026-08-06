export type OrderPaymentMethod = 'COD' | 'UPI' | 'Zelle'

export type CreateOrderItemRequest = {
  productId: string
  size: string
  quantity: number
}

export type CreateOrderRequest = {
  shippingAddress: string
  paymentMethod: OrderPaymentMethod
  items: CreateOrderItemRequest[]
}

export type OrderItem = {
  id: string
  productId: string
  productName: string
  size: string
  quantity: number
  price: number
  lineTotal: number
}

export type Order = {
  id: string
  userId: string
  shippingAddress: string
  paymentMethod: OrderPaymentMethod
  status: string
  totalAmount: number
  createdAt: string
  orderItems: OrderItem[]
}