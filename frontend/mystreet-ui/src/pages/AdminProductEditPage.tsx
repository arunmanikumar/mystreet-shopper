import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductForm, type ProductFormValues } from '../components/ProductForm'
import { getProductById, updateProduct } from '../services/productService'
import { ApiServiceError } from '../types/errors'

function toFormValues(product: {
  name: string
  brand: string
  description: string
  price: number
  imageUrl: string
  sizes: string[]
  stockQty: number
}): ProductFormValues {
  return {
    name: product.name,
    brand: product.brand,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    sizesCsv: product.sizes.join(','),
    stockQty: product.stockQty,
  }
}

export function AdminProductEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState<ProductFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const productId = id?.trim() ?? ''

    if (!productId) {
      setIsLoading(false)
      setError('Product id is missing.')
      return
    }

    let isMounted = true

    async function loadProduct() {
      setIsLoading(true)
      setError(null)

      try {
        const product = await getProductById(productId)

        if (!isMounted) {
          return
        }

        setFormValues(toFormValues(product))
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        const message = loadError instanceof ApiServiceError ? loadError.message : 'Unable to load this product.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProduct()

    return () => {
      isMounted = false
    }
  }, [id])

  const handleSubmit = async (values: ProductFormValues) => {
    const productId = id?.trim() ?? ''

    if (!productId) {
      setError('Product id is missing.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await updateProduct(productId, values)
      navigate('/admin/products?status=updated', { replace: true })
    } catch (submitError) {
      const message = submitError instanceof ApiServiceError ? submitError.message : 'Unable to update product.'
      setError(message)
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
        <span className="text-stone-500">Edit</span>
      </div>

      <div className="rounded-[2rem] border border-stone-200/80 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="mb-6 max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Edit Product</p>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            Update product details and inventory values.
          </h2>
        </div>

        {isLoading ? (
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-6">
            <p className="text-sm font-medium text-stone-600">Loading product...</p>
          </div>
        ) : null}

        {!isLoading && error && !formValues ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        ) : null}

        {!isLoading && formValues ? (
          <ProductForm
            initialValues={formValues}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
            apiError={error}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </section>
  )
}