/**
 * Provider-Agnostic Refund Handler
 *
 * Routes refund requests to the appropriate payment provider based on
 * the original transaction's payment method.
 */

import type { RefundResult, PaymentProviderName } from './types'
import { processFullRefund, processPartialRefund } from '../stripe/refunds'
import { createPayseraProvider } from './adapters/paysera'
import { createNeopayProvider } from './adapters/neopay'

/**
 * Determines the payment provider from a transaction object
 */
export function getProviderFromTransaction(transaction: {
  stripe?: { paymentIntentID?: string | null }
  paysera?: { transactionId?: string | null; sessionId?: string | null }
  neopay?: { transactionId?: string | null }
}): PaymentProviderName | null {
  if (transaction.stripe?.paymentIntentID) {
    return 'stripe'
  }
  if (transaction.paysera?.transactionId || transaction.paysera?.sessionId) {
    return 'paysera'
  }
  if (transaction.neopay?.transactionId) {
    return 'neopay'
  }
  return null
}

/**
 * Gets the transaction ID for a specific provider
 */
export function getTransactionId(
  provider: PaymentProviderName,
  transaction: {
    stripe?: { paymentIntentID?: string | null }
    paysera?: { transactionId?: string | null }
    neopay?: { transactionId?: string | null }
  },
): string | null {
  switch (provider) {
    case 'stripe':
      return transaction.stripe?.paymentIntentID || null
    case 'paysera':
      return transaction.paysera?.transactionId || null
    case 'neopay':
      return transaction.neopay?.transactionId || null
    default:
      return null
  }
}

/**
 * Process a refund through the appropriate payment provider
 *
 * @param provider - The payment provider name
 * @param transactionId - The provider's transaction/payment ID
 * @param amount - Optional amount for partial refunds (in smallest currency unit)
 * @param reason - Optional reason for the refund
 */
export async function processRefund(
  provider: PaymentProviderName,
  transactionId: string,
  amount?: number,
  reason?: string,
): Promise<RefundResult> {
  switch (provider) {
    case 'stripe':
      return processStripeRefund(transactionId, amount, reason)

    case 'paysera':
      return processPayseraRefund(transactionId, amount)

    case 'neopay':
      return processNeopayRefund(transactionId, amount)

    default:
      return {
        refundId: '',
        status: 'failed',
        errorMessage: `Unsupported payment provider: ${provider}`,
      }
  }
}

/**
 * Process Stripe refund
 */
async function processStripeRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string,
): Promise<RefundResult> {
  try {
    const refund = amount
      ? await processPartialRefund(paymentIntentId, amount, reason)
      : await processFullRefund(paymentIntentId, reason)

    return {
      refundId: refund.id,
      status: refund.status === 'succeeded' ? 'succeeded' : 'pending',
    }
  } catch (error) {
    return {
      refundId: '',
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Stripe refund failed',
    }
  }
}

/**
 * Process Paysera refund
 */
async function processPayseraRefund(
  transactionId: string,
  amount?: number,
): Promise<RefundResult> {
  // Paysera refunds require credentials
  const projectId = process.env.PAYSERA_PROJECT_ID
  const signPassword = process.env.PAYSERA_SIGN_PASSWORD

  if (!projectId || !signPassword) {
    return {
      refundId: '',
      status: 'failed',
      errorMessage: 'Paysera credentials not configured',
    }
  }

  const provider = createPayseraProvider({ projectId, signPassword })
  return provider.refundPayment(transactionId, amount)
}

/**
 * Process Neopay refund
 */
async function processNeopayRefund(
  transactionId: string,
  amount?: number,
): Promise<RefundResult> {
  // Neopay refunds require credentials
  const merchantId = process.env.NEOPAY_MERCHANT_ID
  const secretKey = process.env.NEOPAY_SECRET_KEY

  if (!merchantId || !secretKey) {
    return {
      refundId: '',
      status: 'failed',
      errorMessage: 'Neopay credentials not configured',
    }
  }

  const provider = createNeopayProvider({ merchantId, secretKey })
  return provider.refundPayment(transactionId, amount)
}
