/**
 * Paysera Payment Provider Implementation
 *
 * Implements the RedirectPaymentProvider interface for Paysera payments.
 * @see https://developers.paysera.com/lt/checkout/integrations/integration-specification
 * @see https://developers.paysera.com/lt/checkout/integrations/integration-callback
 */

import type {
  RedirectPaymentProvider,
  PaymentSessionData,
  RedirectPaymentResult,
  PaymentCallbackResult,
  RefundResult,
} from '../../types'
import type {
  PayseraConfig,
  PayseraRequestParams,
  PayseraCallbackData,
  PayseraStatus,
} from './types'
import crypto from 'crypto'

const PAYSERA_API_URL = 'https://www.paysera.com/pay/'
const PAYSERA_API_VERSION = '1.6'

/**
 * Encodes data to base64 URL-safe format (Paysera requirement)
 */
function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

/**
 * Decodes base64 URL-safe format
 */
function base64UrlDecode(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(base64, 'base64').toString('utf-8')
}

/**
 * Generates MD5 signature for Paysera request
 */
function generateSignature(data: string, signPassword: string): string {
  return crypto.createHash('md5').update(data + signPassword).digest('hex')
}

/**
 * Verifies callback signature from Paysera
 */
function verifySignature(data: string, ss1: string, signPassword: string): boolean {
  const expectedSignature = generateSignature(data, signPassword)
  return ss1 === expectedSignature
}

/**
 * Creates a Paysera payment provider instance
 */
export function createPayseraProvider(config: PayseraConfig): RedirectPaymentProvider {
  const { projectId, signPassword, testMode = false } = config

  return {
    name: 'paysera',
    label: 'Paysera',
    flowType: 'redirect',

    async createPaymentSession(data: PaymentSessionData): Promise<RedirectPaymentResult> {
      // Generate unique session ID
      const sessionId = `paysera_${Date.now()}_${Math.random().toString(36).substring(7)}`

      // Build request parameters
      const params: PayseraRequestParams = {
        projectid: projectId,
        orderid: sessionId,
        accepturl: data.returnUrl,
        cancelurl: data.returnUrl + '?status=cancelled',
        callbackurl: data.callbackUrl,
        version: PAYSERA_API_VERSION,
        amount: data.amount.toString(),
        currency: data.currency,
        ...(testMode && { test: '1' }),
        ...(data.customerEmail && { p_email: data.customerEmail }),
      }

      // Encode parameters
      const paramsString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
      const encodedData = base64UrlEncode(paramsString)

      // Generate signature
      const signature = generateSignature(encodedData, signPassword)

      // Build redirect URL
      const redirectUrl = `${PAYSERA_API_URL}?data=${encodedData}&sign=${signature}`

      return {
        redirectUrl,
        sessionId,
      }
    },

    async parseCallback(request: Request): Promise<PaymentCallbackResult> {
      try {
        const url = new URL(request.url)
        const data = url.searchParams.get('data')
        const ss1 = url.searchParams.get('ss1')

        if (!data || !ss1) {
          return {
            success: false,
            sessionId: '',
            errorCode: 'MISSING_PARAMS',
            errorMessage: 'Missing data or ss1 parameter',
          }
        }

        // Verify signature
        if (!verifySignature(data, ss1, signPassword)) {
          return {
            success: false,
            sessionId: '',
            errorCode: 'INVALID_SIGNATURE',
            errorMessage: 'Invalid callback signature',
          }
        }

        // Decode and parse callback data
        const decodedData = base64UrlDecode(data)
        const params = new URLSearchParams(decodedData)

        // Parse all callback parameters
        const callbackData: PayseraCallbackData = {
          projectid: params.get('projectid') || undefined,
          orderid: params.get('orderid') || '',
          status: (params.get('status') || '0') as PayseraStatus,
          requestid: params.get('requestid') || '',
          request_amount: params.get('request_amount') || undefined,
          request_currency: params.get('request_currency') || undefined,
          pay_amount: params.get('pay_amount') || undefined,
          pay_currency: params.get('pay_currency') || undefined,
          amount: params.get('amount') || undefined,
          currency: params.get('currency') || undefined,
          payment: params.get('payment') || undefined,
          country: params.get('country') || undefined,
          payment_country: params.get('payment_country') || undefined,
          payer_ip_country: params.get('payer_ip_country') || undefined,
          p_email: params.get('p_email') || undefined,
          name: params.get('name') || undefined,
          surename: params.get('surename') || undefined,
          personcodestatus: params.get('personcodestatus') || undefined,
          paytext: params.get('paytext') || undefined,
          test: params.get('test') || undefined,
          version: params.get('version') || undefined,
          account: params.get('account') || undefined,
        }

        // Only status=1 indicates successful payment
        // Other statuses (0=failed, 2=pending, 3=info, 4=unconfirmed, 5=refunded)
        const isSuccessful = callbackData.status === '1'

        // Build error message based on status
        let errorMessage: string | undefined
        if (!isSuccessful) {
          const statusMessages: Record<PayseraStatus, string> = {
            '0': 'Payment failed',
            '1': '', // Success - no error
            '2': 'Payment pending execution',
            '3': 'Additional payment information received',
            '4': 'Payment completed without confirmation guarantee',
            '5': 'Payment was refunded',
          }
          errorMessage = statusMessages[callbackData.status] || 'Payment was not completed'
        }

        return {
          success: isSuccessful,
          sessionId: callbackData.orderid,
          transactionId: callbackData.requestid,
          ...(isSuccessful
            ? {}
            : {
                errorCode: `STATUS_${callbackData.status}`,
                errorMessage,
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
      // Paysera refunds are typically handled manually through their dashboard
      // or via their REST API (requires additional credentials)
      // For now, we return a pending status indicating manual processing is needed
      return {
        refundId: `paysera_refund_${transactionId}_${Date.now()}`,
        status: 'pending',
        errorMessage: 'Paysera refunds require manual processing through the Paysera dashboard',
      }
    },
  }
}
