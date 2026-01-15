/**
 * Neopay Payment Adapter
 *
 * Exports the Neopay payment provider for use with the ecommerce plugin.
 */

export { createNeopayProvider } from './provider'
export type { NeopayConfig, NeopayCallbackData } from './types'

import { createNeopayProvider } from './provider'
import { createRedirectAdapterConfig } from '../redirect-base'
import type { NeopayConfig } from './types'

/**
 * Creates a Neopay adapter configuration for the ecommerce plugin
 */
export function neopayAdapterConfig(config: NeopayConfig) {
  const provider = createNeopayProvider(config)
  return createRedirectAdapterConfig(provider, {
    label: 'Bank Payment (Neopay)',
  })
}

/**
 * Client-side adapter configuration for Neopay
 */
export function neopayAdapterClient(args: { label?: string } = {}) {
  return {
    name: 'neopay',
    label: args.label || 'Bank Payment (Neopay)',
    confirmOrder: false,
    initiatePayment: true,
  }
}
