/**
 * Centralized store configuration
 * This is the single source of truth for store-wide settings
 */

export const storeConfig = {
  /**
   * Currency configuration
   * Update this to change the store's currency
   */
  currency: {
    code: 'GBP' as const,
    symbol: '£',
    decimals: 2,
    label: 'British Pound',
  },

  /**
   * Store information (defaults)
   * Actual values are fetched from Settings global where available
   */
  store: {
    name: 'My Store',
    company: '',
  },
}

// Type exports for use in other files
export type CurrencyCode = typeof storeConfig.currency.code
export type CurrencyConfig = typeof storeConfig.currency
