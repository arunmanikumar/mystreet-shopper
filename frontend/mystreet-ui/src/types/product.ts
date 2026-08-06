export type Product = {
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

export type ProductWriteRequest = {
  name: string
  brand: string
  description: string
  price: number
  imageUrl: string
  sizesCsv: string
  stockQty: number
}

export type ProductFilters = {
  brand?: string
  size?: string
  search?: string
}
