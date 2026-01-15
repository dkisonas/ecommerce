/**
 * Paysera Payment Adapter
 *
 * Exports the Paysera payment provider for use with the ecommerce plugin.
 */

export { createPayseraProvider } from './provider'
export type { PayseraConfig, PayseraCallbackData } from './types'

import { createPayseraProvider } from './provider'
import { createRedirectAdapterConfig } from '../redirect-base'
import type { PayseraConfig } from './types'

/**
 * Creates a Paysera adapter configuration for the ecommerce plugin
 */
export function payseraAdapterConfig(config: PayseraConfig) {
  const provider = createPayseraProvider(config)
  return createRedirectAdapterConfig(provider, {
    label: 'Bank Transfer (Paysera)',
  })
}

/**
 * Client-side adapter configuration for Paysera
 */
export function payseraAdapterClient(args: { label?: string } = {}) {
  return {
    name: 'paysera',
    label: args.label || 'Bank Transfer (Paysera)',
    confirmOrder: false,
    initiatePayment: true,
  }
}
