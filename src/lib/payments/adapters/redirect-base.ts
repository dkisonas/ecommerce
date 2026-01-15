/**
 * Redirect Payment Adapter Base
 *
 * Factory function that creates a Payload CMS payment adapter from a
 * RedirectPaymentProvider implementation. This handles the common logic
 * for redirect-based payment flows (Paysera, Neopay, etc.)
 */

import type { RedirectPaymentProvider, PaymentSessionData } from '../types'

export interface RedirectAdapterConfig {
  /** Display label for the payment method */
  label?: string
}

/**
 * Creates a payment adapter configuration object for redirect-based providers.
 * This is used to register the payment method with the ecommerce plugin.
 */
export function createRedirectAdapterConfig(
  provider: RedirectPaymentProvider,
  config: RedirectAdapterConfig = {},
) {
  return {
    name: provider.name,
    label: config.label || provider.label,
    flowType: 'redirect' as const,

    /**
     * Client-side configuration - tells the checkout UI how to handle this provider
     */
    client: {
      name: provider.name,
      label: config.label || provider.label,
      // Redirect providers don't use embedded payment forms
      confirmOrder: false,
      initiatePayment: true,
    },
  }
}

/**
 * Helper to build the payment session data from checkout form data
 */
export function buildPaymentSessionData(args: {
  amount: number
  currency: string
  cartId: string
  customerEmail: string
  callbackUrl: string
  returnUrl: string
  siteName?: string
  metadata?: Record<string, unknown>
}): PaymentSessionData {
  return {
    amount: args.amount,
    currency: args.currency,
    orderId: args.cartId,
    callbackUrl: args.callbackUrl,
    returnUrl: args.returnUrl,
    customerEmail: args.customerEmail,
    description: `Order from ${args.siteName || 'Store'}`,
    metadata: args.metadata,
  }
}
