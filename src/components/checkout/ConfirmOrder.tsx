'use client'

// TailwindPlus styled order confirmation
// Adapted for: React, Tailwind v4, dark mode support

import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

export const ConfirmOrder: React.FC = () => {
  const { confirmOrder } = usePayments()
  const { cart } = useCart()

  const searchParams = useSearchParams()
  const router = useRouter()
  // Ensure we only confirm the order once, even if the component re-renders
  const isConfirming = useRef(false)

  useEffect(() => {
    if (!cart || !cart.items || cart.items?.length === 0) {
      return
    }

    const paymentIntentID = searchParams.get('payment_intent')
    const email = searchParams.get('email')

    if (paymentIntentID) {
      if (!isConfirming.current) {
        isConfirming.current = true

        confirmOrder('stripe', {
          additionalData: {
            paymentIntentID,
          },
        }).then((result) => {
          if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
            // Redirect with new=true to show thank you message
            const emailParam = email ? `&email=${email}` : ''
            router.push(`/orders/${result.orderID}?new=true${emailParam}`)
          }
        })
      }
    } else {
      // If no payment intent ID is found, redirect to the home
      router.push('/')
    }
  }, [cart, searchParams, confirmOrder, router])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated success/loading indicator */}
        <div className="mx-auto mb-8 relative">
          <div className="size-20 rounded-full bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center">
            <CheckCircleIcon className="size-10 text-secondary animate-pulse" />
          </div>
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-secondary animate-spin" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Completing your order
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          We&apos;re processing your payment and confirming your order. This will only take a moment.
        </p>

        {/* Progress dots */}
        <div className="mt-8 flex justify-center gap-2">
          <span className="size-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="size-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="size-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Please don&apos;t close this page
        </p>
      </div>
    </div>
  )
}
