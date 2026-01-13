'use client'

import { AuthProvider, useAuth } from '@/providers/Auth'
import { storeConfig } from '@/config/store'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import React from 'react'

import { SonnerProvider } from '@/providers/Sonner'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

// Wrapper component that keys EcommerceProvider on user status
const EcommerceProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, status } = useAuth()

  // Key changes when user logs in/out, forcing EcommerceProvider to re-mount and re-fetch user
  const ecommerceKey = status === 'loggedIn' ? `user-${user?.id}` : 'guest'

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
      paymentMethods={[
        stripeAdapterClient({
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        }),
      ]}
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
