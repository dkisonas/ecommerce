'use client'

// TailwindPlus styled login form
// Adapted for: React, Tailwind v4, dark mode support

import { Message } from '@/components/Message'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
}

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(searchParams.get('redirect'))
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<null | string>(null)

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data)
        if (redirect?.current) router.push(redirect.current)
        else router.push('/')
      } catch (_) {
        setError('There was an error with the credentials provided. Please try again.')
      }
    },
    [login, router],
  )

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <Message error={error} />

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email address
        </label>
        <div className="mt-2">
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email', { required: 'Email is required.' })}
            className="block w-full rounded-md bg-background dark:bg-muted/10 px-3 py-2 text-base text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
        </div>
        {errors.email && (
          <p className="mt-2 text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <div className="mt-2">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password', { required: 'Please provide a password.' })}
            className="block w-full rounded-md bg-background dark:bg-muted/10 px-3 py-2 text-base text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
        </div>
        {errors.password && (
          <p className="mt-2 text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end">
        <div className="text-sm">
          <Link
            href={`/forgot-password${allParams}`}
            className="font-medium text-secondary hover:text-secondary/80"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  )
}
