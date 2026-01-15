/**
 * Neopay Payment Callback Handler
 *
 * Receives server-to-server callbacks from Neopay after payment completion.
 * Validates the signature and logs the result.
 *
 * Note: This is the server callback endpoint. The browser redirect
 * goes to /checkout/payment-callback which handles the client-side flow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createNeopayProvider } from '@/lib/payments/adapters/neopay/provider'

export async function GET(request: NextRequest) {
  return handleCallback(request)
}

export async function POST(request: NextRequest) {
  return handleCallback(request)
}

async function handleCallback(request: NextRequest) {
  try {
    // Check if Neopay is configured
    const merchantId = process.env.NEOPAY_MERCHANT_ID
    const secretKey = process.env.NEOPAY_SECRET_KEY

    if (!merchantId || !secretKey) {
      console.error('Neopay credentials not configured')
      return NextResponse.json(
        { error: 'Payment provider not configured' },
        { status: 500 },
      )
    }

    // Create provider instance
    const provider = createNeopayProvider({
      merchantId,
      secretKey,
      testMode: process.env.NEOPAY_TEST_MODE === 'true',
    })

    // Parse and validate the callback
    const result = await provider.parseCallback(request)

    if (!result.success) {
      console.error('Neopay callback validation failed:', result.errorMessage)
      return NextResponse.json(
        { error: result.errorMessage || 'Invalid callback' },
        { status: 400 },
      )
    }

    // Log successful callback
    console.log(`Neopay callback received:`, {
      sessionId: result.sessionId,
      transactionId: result.transactionId,
      success: result.success,
    })

    // Note: For full implementation, extend the Transactions collection to include
    // a sessionID field for non-Stripe providers, enabling transaction lookup.
    // For now, order updates are handled via the client-side flow through
    // /checkout/payment-callback which uses the plugin's confirmOrder function.

    // Return success response
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Neopay callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
