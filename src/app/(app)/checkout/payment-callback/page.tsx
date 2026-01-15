import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { PaymentCallback } from '@/components/checkout/PaymentCallback'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PaymentProviderName } from '@/lib/payments'

interface Props {
  searchParams: Promise<{ provider?: string; [key: string]: string | undefined }>
}

export default async function PaymentCallbackPage({ searchParams }: Props) {
  const params = await searchParams
  const provider = params.provider as PaymentProviderName | undefined

  // Validate provider
  const validProviders: PaymentProviderName[] = ['paysera', 'neopay']
  if (!provider || !validProviders.includes(provider)) {
    redirect('/checkout')
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
            <LoadingSpinner />
            <p className="mt-6 text-sm text-muted-foreground">Loading...</p>
          </div>
        }
      >
        <PaymentCallback provider={provider} />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Processing Payment',
  description: 'Verifying your payment',
}
