import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ProductForm, type ProductFormValues } from '../components/ProductForm'
import { createProduct } from '../services/productService'
import { ApiServiceError } from '../types/errors'

const initialValues: ProductFormValues = {
  name: '',
  brand: '',
  description: '',
  price: 0,
  imageUrl: '',
  sizesCsv: '',
  stockQty: 0,
}

export function AdminProductCreatePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true)
    setApiError(null)

    try {
      await createProduct(values)
      navigate('/admin/products?status=created', { replace: true })
    } catch (error) {
      const message = error instanceof ApiServiceError ? error.message : 'Unable to create product.'
      setApiError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600">
        <Link to="/admin/products" className="font-medium text-stone-700 transition hover:text-amber-700">
          Admin products
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-stone-500">Create</span>
      </div>

      <div className="rounded-[2rem] border border-stone-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="mb-6 max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">New Product</p>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            Add a product to the catalog.
          </h2>
        </div>

        <ProductForm
          initialValues={initialValues}
          submitLabel="Create Product"
          isSubmitting={isSubmitting}
          apiError={apiError}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  )
}