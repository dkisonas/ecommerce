/**
 * Neopay-specific types
 */

export interface NeopayConfig {
  /** Neopay merchant ID */
  merchantId: string
  /** Secret key for request signatures */
  secretKey: string
  /** Whether to use test mode */
  testMode?: boolean
}

export interface NeopayCallbackData {
  /** Transaction ID from Neopay */
  transaction_id: string
  /** Order ID (our session ID) */
  order_id: string
  /** Payment status */
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  /** Amount in cents */
  amount: number
  /** Currency code */
  currency: string
  /** Signature for verification */
  signature: string
}

export interface NeopayRequestParams {
  merchant_id: string
  order_id: string
  amount: number
  currency: string
  description: string
  return_url: string
  callback_url: string
  customer_email?: string
  test?: boolean
}
