import { describe, expect, it, vi } from 'vitest'
import { apiClient } from '../api/client'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../services/productService'

vi.mock('../api/client', () => {
  return {
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

const mockedApiClient = vi.mocked(apiClient)

describe('productService', () => {
  it('builds trimmed query params for getProducts', async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: [] })

    await getProducts({
      brand: '  Nike  ',
      size: ' 10 ',
      search: '  runner ',
    })

    expect(mockedApiClient.get).toHaveBeenCalledTimes(1)
    expect(mockedApiClient.get).toHaveBeenCalledWith('/products', {
      params: new URLSearchParams({
        brand: 'Nike',
        size: '10',
        search: 'runner',
      }),
    })
  })

  it('returns mapped product from getProductById', async () => {
    const payload = {
      id: 'p1',
      name: 'Runner',
      brand: 'Nike',
      description: 'Desc',
      price: 120,
      imageUrl: 'https://example.com/runner.jpg',
      sizes: ['8', '9'],
      stockQty: 4,
      createdAt: '2026-01-01T00:00:00Z',
    }

    mockedApiClient.get.mockResolvedValueOnce({ data: payload })

    const product = await getProductById('p1')

    expect(mockedApiClient.get).toHaveBeenCalledWith('/products/p1')
    expect(product).toEqual(payload)
  })

  it('calls create, update, and delete endpoints with expected payloads', async () => {
    const request = {
      name: 'Runner',
      brand: 'Nike',
      description: 'Desc',
      price: 100,
      imageUrl: 'https://example.com/r.jpg',
      sizesCsv: '8,9',
      stockQty: 5,
    }

    mockedApiClient.post.mockResolvedValueOnce({ data: { id: 'new', ...request, sizes: ['8', '9'], createdAt: '2026-01-01T00:00:00Z' } })
    mockedApiClient.put.mockResolvedValueOnce({ data: { id: 'p1', ...request, sizes: ['8', '9'], createdAt: '2026-01-01T00:00:00Z' } })
    mockedApiClient.delete.mockResolvedValueOnce({})

    await createProduct(request)
    await updateProduct('p1', request)
    await deleteProduct('p1')

    expect(mockedApiClient.post).toHaveBeenCalledWith('/products', request)
    expect(mockedApiClient.put).toHaveBeenCalledWith('/products/p1', request)
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/products/p1')
  })

  it('throws normalized service errors', async () => {
    mockedApiClient.get.mockRejectedValueOnce(new Error('network down'))

    await expect(getProducts()).rejects.toMatchObject({
      name: 'ApiServiceError',
      message: 'network down',
    })
  })
})