import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { NextResponse } from 'next/server'
import { checkRole } from '@/access/utilities'
import { processRefund, getProviderFromTransaction } from '@/lib/payments/refunds'
import { getPrimaryTransaction } from '@/lib/refunds/validation'
import type { Order } from '@/payload-types'
import type { PaymentProviderName } from '@/lib/payments'

/**
 * POST /api/refunds/process
 * Process a refund (admin only)
 * Can process from approved request or directly
 * Supports multiple payment providers (Stripe, Paysera, Neopay)
 */
export async function POST(request: Request) {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    // Check admin access
    if (!user || !checkRole(['admin'], user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { orderId, refundRequestId, amount, reason, type } = body

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    // Fetch order
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 2,
    }) as Order

    // Get primary transaction
    const transaction = getPrimaryTransaction(order)
    if (!transaction) {
      return NextResponse.json(
        { error: 'No valid transaction found for this order' },
        { status: 400 },
      )
    }

    // Determine payment provider from transaction
    const provider = getProviderFromTransaction(transaction) as PaymentProviderName
    if (!provider) {
      return NextResponse.json(
        { error: 'Unable to determine payment provider from transaction' },
        { status: 400 },
      )
    }

    // Get the transaction ID for the provider
    let transactionId: string | null = null
    if (provider === 'stripe' && transaction.stripe?.paymentIntentID) {
      transactionId = transaction.stripe.paymentIntentID
    }
    // Note: For Paysera and Neopay, transaction IDs would be stored in their respective fields
    // if the schema was extended to support them

    if (!transactionId) {
      return NextResponse.json(
        { error: `No transaction ID found for provider: ${provider}` },
        { status: 400 },
      )
    }

    // Determine refund type and amount
    let refundType: 'full' | 'partial'
    let refundAmount: number

    if (refundRequestId) {
      // Process from approved request
      const refundRequest = await payload.findByID({
        collection: 'refund-requests',
        id: refundRequestId,
      })

      if (refundRequest.status !== 'approved') {
        return NextResponse.json(
          { error: 'Refund request must be approved before processing' },
          { status: 400 },
        )
      }

      refundType = refundRequest.type
      refundAmount = refundRequest.amount || order.amount || 0
    } else {
      // Direct refund
      if (!type || !amount) {
        return NextResponse.json(
          { error: 'type and amount are required for direct refunds' },
          { status: 400 },
        )
      }

      refundType = type
      refundAmount = amount
    }

    // Process refund via the appropriate provider
    const refundResult = await processRefund(
      provider,
      transactionId,
      refundType === 'partial' ? refundAmount : undefined,
      reason,
    )

    if (refundResult.status === 'failed') {
      return NextResponse.json(
        { error: refundResult.errorMessage || `Refund failed for provider: ${provider}` },
        { status: 400 },
      )
    }

    // Create refund record
    // @ts-expect-error - Payload types generated incorrectly for some collections
    const refund = await payload.create({
      collection: 'refunds',
      data: {
        order: orderId,
        transaction: transaction.id,
        amount: refundAmount,
        type: refundType,
        status: refundResult.status === 'succeeded' ? 'completed' : 'processing',
        stripeRefundId: provider === 'stripe' ? refundResult.refundId : undefined,
        paymentIntentId: provider === 'stripe' ? transactionId : undefined,
        reason: reason || undefined,
        refundRequest: refundRequestId || undefined,
      },
      user,
    })

    // Update refund request if processed from request
    if (refundRequestId) {
      await payload.update({
        collection: 'refund-requests',
        id: refundRequestId,
        data: {
          refund: refund.id,
        },
      })
    }

    return NextResponse.json(
      {
        message: 'Refund processed successfully',
        refund,
        providerRefund: {
          provider,
          id: refundResult.refundId,
          status: refundResult.status,
        },
      },
      { status: 201 },
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process refund'
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 },
    )
  }
}

