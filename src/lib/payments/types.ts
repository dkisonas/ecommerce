/**
 * Payment Provider Types
 *
 * This module defines the interfaces for payment providers in the ecommerce system.
 * Supports both embedded (Stripe) and redirect-based (Paysera, Neopay) payment flows.
 */

export type PaymentFlowType = 'embedded' | 'redirect'

/**
 * Result of initiating a redirect-based payment
 */
export interface RedirectPaymentResult {
  /** URL to redirect the customer to for payment */
  redirectUrl: string
  /** Unique session identifier for this payment */
  sessionId: string
}

/**
 * Data passed to createPaymentSession
 */
export interface PaymentSessionData {
  /** Amount in smallest currency unit (e.g., pence for GBP) */
  amount: number
  /** ISO 4217 currency code (e.g., 'GBP', 'EUR') */
  currency: string
  /** Internal order/cart ID for reference */
  orderId: string
  /** URL for provider to call after payment */
  callbackUrl: string
  /** URL to redirect customer after payment */
  returnUrl: string
  /** Customer email for notifications */
  customerEmail: string
  /** Order description */
  description?: string
  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Result of parsing a payment callback
 */
export interface PaymentCallbackResult {
  /** Whether the payment was successful */
  success: boolean
  /** Session ID from the original payment request */
  sessionId: string
  /** Provider's transaction ID (if successful) */
  transactionId?: string
  /** Error code (if failed) */
  errorCode?: string
  /** Error message (if failed) */
  errorMessage?: string
}

/**
 * Result of a refund operation
 */
export interface RefundResult {
  /** Provider's refund ID */
  refundId: string
  /** Refund status */
  status: 'pending' | 'succeeded' | 'failed'
  /** Error message if failed */
  errorMessage?: string
}

/**
 * Interface for redirect-based payment providers (Paysera, Neopay, etc.)
 */
export interface RedirectPaymentProvider {
  /** Unique identifier for this provider */
  name: string
  /** Display name for UI */
  label: string
  /** Payment flow type */
  flowType: 'redirect'

  /**
   * Creates a payment session and returns the redirect URL
   */
  createPaymentSession(data: PaymentSessionData): Promise<RedirectPaymentResult>

  /**
   * Validates and parses the callback from the payment provider
   */
  parseCallback(request: Request): Promise<PaymentCallbackResult>

  /**
   * Processes a refund for a previous transaction
   * @param transactionId - The provider's transaction ID
   * @param amount - Optional amount for partial refunds (in smallest currency unit)
   */
  refundPayment(transactionId: string, amount?: number): Promise<RefundResult>
}

/**
 * Configuration for which payment methods are enabled
 */
export interface PaymentMethodsConfig {
  stripe?: {
    enabled: boolean
  }
  paysera?: {
    enabled: boolean
  }
  neopay?: {
    enabled: boolean
  }
}

/**
 * Supported payment provider names
 */
export type PaymentProviderName = 'stripe' | 'paysera' | 'neopay'
