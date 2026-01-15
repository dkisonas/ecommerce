'use client'

// TailwindPlus styled payment callback handler
// Adapted for: React, Tailwind v4, dark mode support

import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { PaymentProviderName } from '@/lib/payments'

type CallbackStatus = 'processing' | 'success' | 'error'

interface Props {
  provider: PaymentProviderName
}

export const PaymentCallback: React.FC<Props> = ({ provider }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { confirmOrder } = usePayments()
  const { clearCart } = useCart()
  const [status, setStatus] = useState<CallbackStatus>('processing')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [orderId, setOrderId] = useState<string | null>(null)
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Prevent double processing
    if (hasProcessed.current) return
    hasProcessed.current = true

    const processCallback = async () => {
      try {
        // Get all query params to pass to confirm endpoint
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })

        // Confirm the order with the provider
        const result = await confirmOrder(provider, {
          additionalData: {
            callbackParams: params,
            customerEmail: params.email,
          },
        })

        if (result && typeof result === 'object' && 'orderID' in result) {
          // Clear cart on success
          clearCart()
          setOrderId(result.orderID as string)
          setStatus('success')

          // Redirect to order page after a brief delay
          const email = params.email
          const redirectUrl = `/orders/${result.orderID}${email ? `?email=${email}` : ''}`
          setTimeout(() => {
            router.push(redirectUrl)
          }, 2000)
        } else {
          throw new Error('Invalid confirmation response')
        }
      } catch (err) {
        console.error('Payment callback error:', err)
        setStatus('error')
        setErrorMessage(
          err instanceof Error ? err.message : 'Payment verification failed',
        )
      }
    }

    processCallback()
  }, [searchParams, confirmOrder, clearCart, router, provider])

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <LoadingSpinner />
        <h2 className="mt-6 text-lg font-medium text-foreground">
          Verifying your payment...
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we confirm your payment.
        </p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircleIcon className="size-10 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="mt-6 text-lg font-medium text-foreground">
          Payment successful!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting you to your order...
        </p>
        {orderId && (
          <Link
            href={`/orders/${orderId}`}
            className="mt-4 text-sm font-medium text-secondary hover:text-secondary/80"
          >
            View order now
          </Link>
        )}
      </div>
    )
  }

  // Error state
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <XCircleIcon className="size-10 text-red-600 dark:text-red-500" />
      </div>
      <h2 className="mt-6 text-lg font-medium text-foreground">
        Payment verification failed
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md text-center">
        {errorMessage ||
          'We could not verify your payment. If you were charged, please contact support.'}
      </p>
      <div className="mt-6 flex gap-4">
        <Link
          href="/checkout"
          className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90"
        >
          Try again
        </Link>
        <Link
          href="/contact"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Contact support
        </Link>
      </div>
    </div>
  )
}
