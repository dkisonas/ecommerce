'use client'

import { AuthProvider, useAuth } from '@/providers/Auth'
import { storeConfig } from '@/config/store'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import React, { useMemo } from 'react'

import { SonnerProvider } from '@/providers/Sonner'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { payseraAdapterClient, neopayAdapterClient } from '@/lib/payments'

/**
 * Build the list of available payment methods based on environment configuration.
 * The actual enabled/disabled state is controlled via Settings in the admin panel.
 */
function getAvailablePaymentMethods() {
  const methods = []

  // Stripe is always available if configured
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    methods.push(
      stripeAdapterClient({
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      }),
    )
  }

  // Paysera - available if env vars are set (actual enabling is via Settings)
  if (process.env.NEXT_PUBLIC_PAYSERA_ENABLED === 'true') {
    methods.push(payseraAdapterClient({ label: 'Bank Transfer (Paysera)' }))
  }

  // Neopay - available if env vars are set (actual enabling is via Settings)
  if (process.env.NEXT_PUBLIC_NEOPAY_ENABLED === 'true') {
    methods.push(neopayAdapterClient({ label: 'Bank Payment (Neopay)' }))
  }

  return methods
}

// Wrapper component that keys EcommerceProvider on user status
const EcommerceProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, status } = useAuth()

  // Key changes when user logs in/out, forcing EcommerceProvider to re-mount and re-fetch user
  const ecommerceKey = status === 'loggedIn' ? `user-${user?.id}` : 'guest'

  // Memoize payment methods to avoid recreating on every render
  const paymentMethods = useMemo(() => getAvailablePaymentMethods(), [])

  return (
    <EcommerceProvider
      key={ecommerceKey}
      enableVariants={true}
      currenciesConfig={{
        defaultCurrency: storeConfig.currency.code,
        supportedCurrencies: [storeConfig.currency],
      }}
      api={{
        cartsFetchQuery: {
          depth: 2,
          populate: {
            products: {
              slug: true,
              title: true,
              gallery: true,
              inventory: true,
            },
            variants: {
              title: true,
              inventory: true,
            },
          },
        },
      }}
      paymentMethods={paymentMethods}
    >
      {children}
    </EcommerceProvider>
  )
}

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          <EcommerceProviderWrapper>{children}</EcommerceProviderWrapper>
        </HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
