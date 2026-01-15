import type { Order, Product, Media as MediaType } from '@/payload-types'
import type { Metadata } from 'next'

import { Price } from '@/components/Price'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RefundRequestForm } from '@/components/refunds/RefundRequestForm'
import { RefundStatus } from '@/components/refunds/RefundStatus'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ShoppingBagIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'

// Status display helper (same as orders list page)
function getStatusDisplay(status: string) {
  switch (status) {
    case 'completed':
      return {
        text: 'Delivered',
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-500/10',
      }
    case 'processing':
      return {
        text: 'Processing',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-500/10',
      }
    case 'pending':
      return {
        text: 'Pending',
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-500/10',
      }
    case 'refund_requested':
      return {
        text: 'Refund Requested',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
      }
    case 'refunded':
      return {
        text: 'Refunded',
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-500/10',
      }
    case 'partially_refunded':
      return {
        text: 'Partially Refunded',
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-500/10',
      }
    case 'cancelled':
      return {
        text: 'Cancelled',
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-500/10',
      }
    default:
      return { text: status, color: 'text-muted-foreground', bg: 'bg-muted' }
  }
}

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string; new?: string }>
}

export default async function Order({ params, searchParams }: PageProps) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { id } = await params
  const { email = '', new: isNewOrder } = await searchParams

  let order: Order | null = null

  try {
    const {
      docs: [orderResult],
    } = await payload.find({
      collection: 'orders',
      user,
      overrideAccess: !Boolean(user),
      depth: 2,
      where: {
        and: [
          {
            id: {
              equals: id,
            },
          },
          ...(user
            ? [
                {
                  customer: {
                    equals: user.id,
                  },
                },
              ]
            : []),
          ...(email
            ? [
                {
                  customerEmail: {
                    equals: email,
                  },
                },
              ]
            : []),
        ],
      },
      select: {
        amount: true,
        currency: true,
        items: true,
        customerEmail: true,
        customer: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shippingAddress: true,
        totalRefunded: true,
        refunds: true,
      },
    })

    const canAccessAsGuest =
      !user &&
      email &&
      orderResult &&
      orderResult.customerEmail &&
      orderResult.customerEmail === email
    const canAccessAsUser =
      user &&
      orderResult &&
      orderResult.customer &&
      (typeof orderResult.customer === 'object'
        ? orderResult.customer.id
        : orderResult.customer) === user.id

    if (orderResult && (canAccessAsGuest || canAccessAsUser)) {
      order = orderResult
    }
  } catch (error) {
    // Silently handle error - will show notFound() below
  }

  if (!order) {
    notFound()
  }

  // Fetch refund requests for this order
  let refundRequests: any[] = []
  try {
    const refundRequestsResult = await payload.find({
      collection: 'refund-requests',
      where: {
        order: {
          equals: order.id,
        },
      },
      depth: 2,
      sort: '-createdAt',
    })
    refundRequests = refundRequestsResult.docs
  } catch (error) {
    // Silently handle error
  }

  // Get active refund request (pending or approved)
  const activeRefundRequest = refundRequests.find(
    (r) => r.status === 'pending' || r.status === 'approved',
  )

  const statusDisplay = order.status ? getStatusDisplay(order.status) : null
  const itemsCount = order.items?.length || 0

  // Check if refunds should be shown - only for completed orders
  const showRefundsSection =
    order.status === 'completed' ||
    order.status === 'refund_requested'

  return (
    <>
      {/* Thank You Banner for new orders */}
      {isNewOrder === 'true' && (
        <div className="mt-6 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <CheckCircleIcon className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">
                Thank you for your order!
              </h2>
              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                Your order has been confirmed and is being processed. You&apos;ll receive a confirmation email shortly with your order details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="py-6">
        <Breadcrumbs
          items={[
            { name: 'Orders', href: '/orders' },
            { name: `Order #${order.id}`, href: `/orders/${order.id}`, current: true },
          ]}
        />
      </div>

      {/* Page Header */}
      <div className="pb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Order #{order.id}</h1>
          {statusDisplay && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}
            >
              {statusDisplay.text}
            </span>
          )}
        </div>
        <p className="mt-1 text-muted-foreground">
          Placed on {formatDateTime({ date: order.createdAt, format: 'MMM dd, yyyy' })}
          <span className="mx-1.5">·</span>
          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
          {typeof order.amount === 'number' && (
            <>
              <span className="mx-1.5">·</span>
              <Price amount={order.amount} currencyCode={order.currency ?? undefined} />
            </>
          )}
        </p>
      </div>

      {/* Order Items Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {order.items?.map((item, idx) => {
            const product = item.product as Product | undefined
            const image = product?.gallery?.[0]?.image as MediaType | undefined

            return (
              <div key={idx} className="flex items-center gap-4 p-4">
                {/* Product image */}
                <div className="size-16 shrink-0 rounded-lg bg-muted overflow-hidden relative">
                  {image ? (
                    <Media fill imgClassName="size-full object-cover" resource={image} />
                  ) : (
                    <div className="size-full bg-muted flex items-center justify-center">
                      <ShoppingBagIcon className="size-6 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground">
                    {product?.slug ? (
                      <Link href={`/products/${product.slug}`} className="hover:text-secondary">
                        {product?.title || 'Product'}
                      </Link>
                    ) : (
                      product?.title || 'Product'
                    )}
                  </h3>
                  {item.variant && typeof item.variant === 'object' && item.variant.title && (
                    <p className="text-sm text-muted-foreground">{item.variant.title}</p>
                  )}
                  <p className="mt-0.5 text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>

                {/* Price */}
                {product?.priceInGBP && (
                  <div className="text-sm font-medium text-foreground">
                    <Price amount={product.priceInGBP} currencyCode={order.currency ?? undefined} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Shipping & Summary */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-foreground">Shipping address</h3>
            <address className="mt-2 text-sm text-muted-foreground not-italic">
              {order.shippingAddress.firstName && order.shippingAddress.lastName && (
                <span className="block">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </span>
              )}
              {order.shippingAddress.addressLine1 && (
                <span className="block">{order.shippingAddress.addressLine1}</span>
              )}
              {order.shippingAddress.addressLine2 && (
                <span className="block">{order.shippingAddress.addressLine2}</span>
              )}
              <span className="block">
                {order.shippingAddress.city}
                {order.shippingAddress.state && `, ${order.shippingAddress.state}`}{' '}
                {order.shippingAddress.postalCode}
              </span>
              {order.shippingAddress.country && (
                <span className="block">{order.shippingAddress.country}</span>
              )}
            </address>
          </div>
        )}

        {/* Order Summary */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground">Order summary</h3>
          <dl className="mt-3 space-y-2 text-sm">
            {typeof order.amount === 'number' && (
              <>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Order total</dt>
                  <dd className="font-semibold text-foreground text-base">
                    <Price amount={order.amount} currencyCode={order.currency ?? undefined} />
                  </dd>
                </div>
                {typeof order.totalRefunded === 'number' && order.totalRefunded > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Refunded</dt>
                      <dd className="text-green-600 dark:text-green-400">
                        -<Price amount={order.totalRefunded} currencyCode={order.currency ?? undefined} />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <dt className="font-medium text-foreground">Amount paid</dt>
                      <dd className="font-semibold text-foreground text-base">
                        <Price amount={order.amount - order.totalRefunded} currencyCode={order.currency ?? undefined} />
                      </dd>
                    </div>
                  </>
                )}
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Refund Section - only show for completed orders */}
      {showRefundsSection && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Refunds</h3>
            {!activeRefundRequest && (
              <RefundRequestForm
                order={order}
                userEmail={user?.email || order.customerEmail || undefined}
              />
            )}
          </div>

          {activeRefundRequest ? (
            <div className="mt-4">
              <RefundStatus refundRequest={activeRefundRequest} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No refund requests for this order.
            </p>
          )}
        </div>
      )}
    </>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  return {
    description: `Order details for order ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Order ${id}`,
      url: `/orders/${id}`,
    }),
    title: `Order ${id}`,
  }
}
