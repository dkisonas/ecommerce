/**
 * Paysera Payment Callback Handler
 *
 * Receives server-to-server callbacks from Paysera after payment completion.
 * Validates the signature and updates the order status.
 *
 * Note: This is the server callback endpoint. The browser redirect
 * goes to /checkout/payment-callback which handles the client-side flow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createPayseraProvider } from '@/lib/payments/adapters/paysera/provider'

export async function GET(request: NextRequest) {
  return handleCallback(request)
}

export async function POST(request: NextRequest) {
  return handleCallback(request)
}

async function handleCallback(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Check if Paysera is configured
    const projectId = process.env.PAYSERA_PROJECT_ID
    const signPassword = process.env.PAYSERA_SIGN_PASSWORD

    if (!projectId || !signPassword) {
      console.error('Paysera credentials not configured')
      return NextResponse.json(
        { error: 'Payment provider not configured' },
        { status: 500 },
      )
    }

    // Create provider instance
    const provider = createPayseraProvider({
      projectId,
      signPassword,
      testMode: process.env.PAYSERA_TEST_MODE === 'true',
    })

    // Parse and validate the callback
    const result = await provider.parseCallback(request)

    if (!result.success) {
      console.error('Paysera callback validation failed:', result.errorMessage)
      return NextResponse.json(
        { error: result.errorMessage || 'Invalid callback' },
        { status: 400 },
      )
    }

    // Log successful callback
    console.log(`Paysera callback received:`, {
      sessionId: result.sessionId,
      transactionId: result.transactionId,
      success: result.success,
    })

    // Note: For full implementation, extend the Transactions collection to include
    // a sessionID field for non-Stripe providers, enabling transaction lookup.
    // For now, order updates are handled via the client-side flow through
    // /checkout/payment-callback which uses the plugin's confirmOrder function.

    // Paysera expects 'OK' response to acknowledge the callback
    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Paysera callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
