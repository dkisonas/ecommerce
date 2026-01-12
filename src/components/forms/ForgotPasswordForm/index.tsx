'use client'

// TailwindPlus styled forgot password form
// Adapted for: React, Tailwind v4, dark mode support

import { Message } from '@/components/Message'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import React, { Fragment, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
}

export const ForgotPasswordForm: React.FC = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(async (data: FormData) => {
    setLoading(true)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/forgot-password`,
      {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    )

    setLoading(false)

    if (response.ok) {
      setSuccess(true)
      setError('')
    } else {
      setError(
        'There was a problem while attempting to send you a password reset email. Please try again.',
      )
    }
  }, [])

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary/10">
          <CheckCircleIcon className="size-6 text-secondary" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-foreground">Check your email</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ve sent a password reset link to your email address. Please check your inbox.
        </p>
      </div>
    )
  }

  return (
    <Fragment>
      <p className="text-sm text-muted-foreground mb-6">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

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
              {...register('email', { required: 'Please provide your email.' })}
              className="block w-full rounded-md bg-background dark:bg-muted/10 px-3 py-2 text-base text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </div>
      </form>
    </Fragment>
  )
}
