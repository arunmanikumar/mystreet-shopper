import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const imageUrlSchema = z
  .url('Enter a valid image URL.')
  .refine((value) => {
    const lower = value.toLowerCase()
    return lower.startsWith('http://') || lower.startsWith('https://')
  }, 'Image URL must start with http:// or https://.')

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  brand: z.string().trim().min(1, 'Brand is required.'),
  description: z.string().trim().min(1, 'Description is required.'),
  price: z.number().positive('Price must be greater than 0.'),
  imageUrl: imageUrlSchema,
  sizesCsv: z.string().trim().min(1, 'At least one size is required.').refine((value) => {
    const sizes = value
      .split(',')
      .map((size) => size.trim())
      .filter(Boolean)

    return sizes.length > 0
  }, 'At least one size is required.'),
  stockQty: z.number().min(0, 'Stock quantity cannot be negative.'),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

type ProductFormProps = {
  initialValues: ProductFormValues
  submitLabel: string
  isSubmitting?: boolean
  apiError?: string | null
  onSubmit: (values: ProductFormValues) => Promise<void>
}

export function ProductForm({ initialValues, submitLabel, isSubmitting = false, apiError = null, onSubmit }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialValues,
  })

  return (
    <form
      className="grid gap-5 sm:grid-cols-2"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values)
      })}
      noValidate
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium text-stone-800">Name</span>
        <input
          type="text"
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
          {...register('name')}
        />
        {errors.name ? <span className="text-sm text-rose-700">{errors.name.message}</span> : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-stone-800">Brand</span>
        <input
          type="text"
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
          {...register('brand')}
        />
        {errors.brand ? <span className="text-sm text-rose-700">{errors.brand.message}</span> : null}
      </label>

      <label className="block space-y-2 sm:col-span-2">
        <span className="text-sm font-medium text-stone-800">Description</span>
        <textarea
          rows={4}
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
          {...register('description')}
        />
        {errors.description ? <span className="text-sm text-rose-700">{errors.description.message}</span> : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-stone-800">Price</span>
        <input
          type="number"
          min="0"
          step="0.01"
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
          {...register('price', { valueAsNumber: true })}
        />
        {errors.price ? <span className="text-sm text-rose-700">{errors.price.message}</span> : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-stone-800">Stock Quantity</span>
        <input
          type="number"
          min="0"
          step="1"
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
          {...register('stockQty', { valueAsNumber: true })}
        />
        {errors.stockQty ? <span className="text-sm text-rose-700">{errors.stockQty.message}</span> : null}
      </label>

      <label className="block space-y-2 sm:col-span-2">
        <span className="text-sm font-medium text-stone-800">Image URL</span>
        <input
          type="url"
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
          {...register('imageUrl')}
        />
        {errors.imageUrl ? <span className="text-sm text-rose-700">{errors.imageUrl.message}</span> : null}
      </label>

      <label className="block space-y-2 sm:col-span-2">
        <span className="text-sm font-medium text-stone-800">Sizes CSV</span>
        <input
          type="text"
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
          placeholder="Example: 7,8,9,10"
          {...register('sizesCsv')}
        />
        {errors.sizesCsv ? <span className="text-sm text-rose-700">{errors.sizesCsv.message}</span> : null}
      </label>

      {apiError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:col-span-2">
          {apiError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400 sm:col-span-2"
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}