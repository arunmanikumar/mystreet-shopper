import { apiClient } from '../api/client'
import { getApiErrorMessage } from '../types/errors'
import type { Product, ProductFilters, ProductWriteRequest } from '../types/product'

type ProductApiResponse = {
  id: string
  name: string
  brand: string
  description: string
  price: number
  imageUrl: string
  sizes: string[]
  stockQty: number
  createdAt: string
}

function mapProduct(response: ProductApiResponse): Product {
  return response
}

function buildQueryParams(filters: ProductFilters = {}) {
  const params = new URLSearchParams()

  if (filters.brand?.trim()) {
    params.set('brand', filters.brand.trim())
  }

  if (filters.size?.trim()) {
    params.set('size', filters.size.trim())
  }

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim())
  }

  return params
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  try {
    const params = buildQueryParams(filters)
    const response = await apiClient.get<ProductApiResponse[]>('/products', {
      params,
    })

    return response.data.map(mapProduct)
  } catch (error) {
    throw getApiErrorMessage(error, 'Unable to load products.')
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await apiClient.get<ProductApiResponse>(`/products/${id}`)
    return mapProduct(response.data)
  } catch (error) {
    throw getApiErrorMessage(error, 'Unable to load this product.')
  }
}

export async function createProduct(request: ProductWriteRequest): Promise<Product> {
  try {
    const response = await apiClient.post<ProductApiResponse>('/products', request)
    return mapProduct(response.data)
  } catch (error) {
    throw getApiErrorMessage(error, 'Unable to create product.')
  }
}

export async function updateProduct(id: string, request: ProductWriteRequest): Promise<Product> {
  try {
    const response = await apiClient.put<ProductApiResponse>(`/products/${id}`, request)
    return mapProduct(response.data)
  } catch (error) {
    throw getApiErrorMessage(error, 'Unable to update product.')
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await apiClient.delete(`/products/${id}`)
  } catch (error) {
    throw getApiErrorMessage(error, 'Unable to delete product.')
  }
}
