'use client'

import { createContext, useContext, useMemo } from 'react'
import { useAuth } from '@/providers/Auth'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'

type HeaderContextValue = {
  isLoading: boolean
  user: ReturnType<typeof useAuth>['user']
  cart: ReturnType<typeof useCart>['cart']
}

// Export context directly so components can optionally consume it without throwing
// (e.g., CartModal uses useContext(HeaderContext) which returns null if outside provider)
export const HeaderContext = createContext<HeaderContextValue | null>(null)

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const { user, status: authStatus } = useAuth()
  const { cart } = useCart()

  // Unified loading state - true until auth is ready
  // This prevents "Log in" from flashing when user is authenticated
  // Cart handles its own loading state internally
  const isLoading = authStatus === undefined

  const value = useMemo(
    () => ({
      isLoading,
      user,
      cart,
    }),
    [isLoading, user, cart],
  )

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>
}

export function useHeaderContext() {
  const context = useContext(HeaderContext)
  if (!context) {
    throw new Error('useHeaderContext must be used within HeaderProvider')
  }
  return context
}
