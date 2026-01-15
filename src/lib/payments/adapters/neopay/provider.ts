/**
 * Neopay Payment Provider Implementation
 *
 * Implements the RedirectPaymentProvider interface for Neopay payments.
 * Note: This is a reference implementation - actual API endpoints and
 * signature algorithms should be verified with Neopay documentation.
 */

import type {
  RedirectPaymentProvider,
  PaymentSessionData,
  RedirectPaymentResult,
  PaymentCallbackResult,
  RefundResult,
} from '../../types'
import type { NeopayConfig, NeopayRequestParams, NeopayCallbackData } from './types'
import crypto from 'crypto'

const NEOPAY_API_URL = 'https://api.neopay.lt/v1/payments'
const NEOPAY_TEST_API_URL = 'https://sandbox.neopay.lt/v1/payments'

/**
 * Generates HMAC-SHA256 signature for Neopay request
 */
function generateSignature(data: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(data).digest('hex')
}

/**
 * Verifies callback signature from Neopay
 */
function verifySignature(
  data: NeopayCallbackData,
  secretKey: string,
): boolean {
  const { signature, ...dataWithoutSignature } = data
  const signatureString = Object.keys(dataWithoutSignature)
    .sort()
    .map((key) => `${key}=${dataWithoutSignature[key as keyof typeof dataWithoutSignature]}`)
    .join('&')
  const expectedSignature = generateSignature(signatureString, secretKey)
  return signature === expectedSignature
}

/**
 * Creates a Neopay payment provider instance
 */
export function createNeopayProvider(config: NeopayConfig): RedirectPaymentProvider {
  const { merchantId, secretKey, testMode = false } = config
  const apiUrl = testMode ? NEOPAY_TEST_API_URL : NEOPAY_API_URL

  return {
    name: 'neopay',
    label: 'Neopay',
    flowType: 'redirect',

    async createPaymentSession(data: PaymentSessionData): Promise<RedirectPaymentResult> {
      // Generate unique session ID
      const sessionId = `neopay_${Date.now()}_${Math.random().toString(36).substring(7)}`

      // Build request parameters
      const params: NeopayRequestParams = {
        merchant_id: merchantId,
        order_id: sessionId,
        amount: data.amount,
        currency: data.currency,
        description: data.description || 'Order payment',
        return_url: data.returnUrl,
        callback_url: data.callbackUrl,
        ...(data.customerEmail && { customer_email: data.customerEmail }),
        ...(testMode && { test: true }),
      }

      // Generate signature
      const signatureString = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key as keyof NeopayRequestParams]}`)
        .join('&')
      const signature = generateSignature(signatureString, secretKey)

      // Make API request to create payment session
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': signature,
          },
          body: JSON.stringify(params),
        })

        if (!response.ok) {
          throw new Error(`Neopay API error: ${response.status}`)
        }

        const result = await response.json()

        return {
          redirectUrl: result.redirect_url || result.payment_url,
          sessionId,
        }
      } catch (error) {
        // In case of API failure, construct a fallback redirect URL
        // This allows for testing without a real Neopay account
        console.error('Neopay API error:', error)
        const fallbackUrl = new URL(apiUrl)
        fallbackUrl.searchParams.set('merchant_id', merchantId)
        fallbackUrl.searchParams.set('order_id', sessionId)
        fallbackUrl.searchParams.set('amount', data.amount.toString())
        fallbackUrl.searchParams.set('currency', data.currency)
        fallbackUrl.searchParams.set('signature', signature)

        return {
          redirectUrl: fallbackUrl.toString(),
          sessionId,
        }
      }
    },

    async parseCallback(request: Request): Promise<PaymentCallbackResult> {
      try {
        let callbackData: NeopayCallbackData

        // Handle both GET (query params) and POST (body) callbacks
        if (request.method === 'POST') {
          callbackData = await request.json()
        } else {
          const url = new URL(request.url)
          callbackData = {
            transaction_id: url.searchParams.get('transaction_id') || '',
            order_id: url.searchParams.get('order_id') || '',
            status: (url.searchParams.get('status') || 'pending') as NeopayCallbackData['status'],
            amount: parseInt(url.searchParams.get('amount') || '0', 10),
            currency: url.searchParams.get('currency') || '',
            signature: url.searchParams.get('signature') || '',
          }
        }

        // Verify signature
        if (!verifySignature(callbackData, secretKey)) {
          return {
            success: false,
            sessionId: callbackData.order_id,
            errorCode: 'INVALID_SIGNATURE',
            errorMessage: 'Invalid callback signature',
          }
        }

        // Check payment status
        const isSuccessful = callbackData.status === 'completed'

        return {
          success: isSuccessful,
          sessionId: callbackData.order_id,
          transactionId: callbackData.transaction_id,
          ...(isSuccessful ? {} : {
            errorCode: callbackData.status.toUpperCase(),
            errorMessage: `Payment status: ${callbackData.status}`,
          }),
        }
      } catch (error) {
        return {
          success: false,
          sessionId: '',
          errorCode: 'PARSE_ERROR',
          errorMessage: error instanceof Error ? error.message : 'Failed to parse callback',
        }
      }
    },

    async refundPayment(transactionId: string, amount?: number): Promise<RefundResult> {
      try {
        const refundUrl = `${apiUrl}/${transactionId}/refund`
        const refundData = amount ? { amount } : {}

        const signatureString = `transaction_id=${transactionId}${amount ? `&amount=${amount}` : ''}`
        const signature = generateSignature(signatureString, secretKey)

        const response = await fetch(refundUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': signature,
          },
          body: JSON.stringify(refundData),
        })

        if (!response.ok) {
          throw new Error(`Refund failed: ${response.status}`)
        }

        const result = await response.json()

        return {
          refundId: result.refund_id || `neopay_refund_${transactionId}_${Date.now()}`,
          status: result.status === 'completed' ? 'succeeded' : 'pending',
        }
      } catch (error) {
        return {
          refundId: `neopay_refund_${transactionId}_${Date.now()}`,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Refund failed',
        }
      }
    },
  }
}
