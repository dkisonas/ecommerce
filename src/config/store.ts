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
   * Store information
   * Used in emails, metadata, etc.
   */
  store: {
    name: process.env.SITE_NAME || 'My Store',
    company: process.env.COMPANY_NAME || '',
  },
}

// Type exports for use in other files
export type CurrencyCode = typeof storeConfig.currency.code
export type CurrencyConfig = typeof storeConfig.currency
