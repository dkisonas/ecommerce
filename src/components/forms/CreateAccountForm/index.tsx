'use client'

// TailwindPlus styled create account form
// Adapted for: React, Tailwind v4, dark mode support

import { Message } from '@/components/Message'
import { useAuth } from '@/providers/Auth'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
  passwordConfirm: string
}

export const CreateAccountForm: React.FC = () => {
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const onSubmit = useCallback(
    async (data: FormData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const message = response.statusText || 'There was an error creating the account.'
        setError(message)
        return
      }

      const redirect = searchParams.get('redirect')

      const timer = setTimeout(() => {
        setLoading(true)
      }, 1000)

      try {
        await login(data)
        clearTimeout(timer)
        if (redirect) router.push(redirect)
        else router.push(`/account?success=${encodeURIComponent('Account created successfully')}`)
      } catch (_) {
        clearTimeout(timer)
        setError('There was an error with the credentials provided. Please try again.')
      }
    },
    [login, router, searchParams],
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
            autoComplete="new-password"
            {...register('password', { required: 'Password is required.' })}
            className="block w-full rounded-md bg-background dark:bg-muted/10 px-3 py-2 text-base text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
        </div>
        {errors.password && (
          <p className="mt-2 text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-foreground">
          Confirm password
        </label>
        <div className="mt-2">
          <input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            {...register('passwordConfirm', {
              required: 'Please confirm your password.',
              validate: (value) => value === password.current || 'The passwords do not match',
            })}
            className="block w-full rounded-md bg-background dark:bg-muted/10 px-3 py-2 text-base text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
        </div>
        {errors.passwordConfirm && (
          <p className="mt-2 text-sm text-destructive">{errors.passwordConfirm.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  )
}
