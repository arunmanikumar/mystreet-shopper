import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required.').max(50, 'First name is too long.'),
    lastName: z.string().trim().min(1, 'Last name is required.').max(50, 'Last name is too long.'),
    email: z.email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .max(100, 'Password is too long.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

type RegisterFormValues = z.infer<typeof registerSchema>

type RedirectState = {
  from?: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, register: registerUser } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = (location.state as RedirectState | null)?.from ?? '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null)
    setIsSubmitting(true)

    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Registration failed.')
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border border-stone-200 bg-white/95 p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Register</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
            Create your MyStreet account
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">
            Registration signs the user in immediately after the backend accepts the request.
          </p>
        </div>

        <form className="grid gap-5 sm:grid-cols-2" onSubmit={onSubmit} noValidate>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">First name</span>
            <input
              type="text"
              autoComplete="given-name"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
              {...register('firstName')}
            />
            {errors.firstName ? <span className="text-sm text-rose-700">{errors.firstName.message}</span> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">Last name</span>
            <input
              type="text"
              autoComplete="family-name"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
              {...register('lastName')}
            />
            {errors.lastName ? <span className="text-sm text-rose-700">{errors.lastName.message}</span> : null}
          </label>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-stone-800">Email</span>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
              {...register('email')}
            />
            {errors.email ? <span className="text-sm text-rose-700">{errors.email.message}</span> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">Password</span>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
              {...register('password')}
            />
            {errors.password ? <span className="text-sm text-rose-700">{errors.password.message}</span> : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-800">Confirm password</span>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? <span className="text-sm text-rose-700">{errors.confirmPassword.message}</span> : null}
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
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-600">
          Already have an account?{' '}
          <Link className="font-medium text-amber-700 hover:text-amber-800" to="/login">
            Sign in
          </Link>
        </p>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-stone-100 p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Account setup</p>
        <h3 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          Start with a local account and continue directly into the app.
        </h3>
        <p className="mt-4 max-w-lg text-sm leading-7 text-stone-700 sm:text-base">
          The form validates required fields, enforces password confirmation, and signs the user in
          immediately after a successful registration response.
        </p>
      </section>
    </div>
  )
}