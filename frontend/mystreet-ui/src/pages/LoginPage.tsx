import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'

const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

type RedirectState = {
  from?: string
}

const helperCredentials = [
  'user@mystreet.com / User@123',
  'admin@mystreet.com / Admin@123',
]

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = (location.state as RedirectState | null)?.from ?? '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null)
    setIsSubmitting(true)

    try {
      await login(values)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Login failed.')
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-stone-200 bg-stone-950 p-8 text-stone-50 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">Welcome back</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Sign in to continue your storefront session.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-7 text-stone-300 sm:text-base">
          Use your account to access orders, checkout workflows, and admin tools when applicable.
        </p>

        {import.meta.env.DEV ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
              Development helper
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-200">
              {helperCredentials.map((credential) => (
                <li key={credential}>{credential}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white/95 p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">Login</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">Account access</h3>
        </div>

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <label className="block space-y-2">
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
              autoComplete="current-password"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-500"
              {...register('password')}
            />
            {errors.password ? <span className="text-sm text-rose-700">{errors.password.message}</span> : null}
          </label>

          {apiError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {apiError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-600">
          Need an account?{' '}
          <Link className="font-medium text-amber-700 hover:text-amber-800" to="/register">
            Create one
          </Link>
        </p>
      </section>
    </div>
  )
}