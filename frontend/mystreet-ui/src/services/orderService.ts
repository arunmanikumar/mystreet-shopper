import { apiClient } from '../api/client'
import { getApiErrorMessage } from '../types/errors'
import type { CreateOrderRequest, Order } from '../types/order'

export async function createOrder(request: CreateOrderRequest): Promise<Order> {
  try {
    const response = await apiClient.post<Order>('/orders', request)
    return response.data
  } catch (error) {
    throw getApiErrorMessage(error, 'Unable to create order.')
  }
}

export async function getMyOrders(): Promise<Order[]> {
  try {
    const response = await apiClient.get<Order[]>('/orders/mine')
    return response.data
  } catch (error) {
    throw getApiErrorMessage(error, 'Unable to load your orders.')
  }
}

export async function getOrderById(id: string): Promise<Order> {
  try {
    const response = await apiClient.get<Order>(`/orders/${id}`)
    return response.data
  } catch (error) {
    throw getApiErrorMessage(error, 'Unable to load this order.')
  }
}