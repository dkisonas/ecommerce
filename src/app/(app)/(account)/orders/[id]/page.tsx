// TailwindPlus Component: Ecommerce.Page Examples.Order Detail Pages.Simple with full order details
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support

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
import { RefundHistory } from '@/components/refunds/RefundHistory'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const dynamic = 'force-dynamic'

// Status display helper
function getStatusDisplay(status: string) {
  switch (status) {
    case 'completed':
      return { text: 'Delivered', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' }
    case 'processing':
      return { text: 'Processing', color: 'text-secondary', bg: 'bg-secondary/10' }
    case 'pending':
      return { text: 'Pending', color: 'text-muted-foreground', bg: 'bg-muted' }
    case 'refund_requested':
      return { text: 'Refund Requested', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' }
    case 'refunded':
      return { text: 'Refunded', color: 'text-muted-foreground', bg: 'bg-muted' }
    case 'partially_refunded':
      return { text: 'Partially Refunded', color: 'text-muted-foreground', bg: 'bg-muted' }
    case 'cancelled':
      return { text: 'Cancelled', color: 'text-muted-foreground', bg: 'bg-muted' }
    default:
      return { text: status, color: 'text-muted-foreground', bg: 'bg-muted' }
  }
}

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string }>
}

export default async function Order({ params, searchParams }: PageProps) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { id } = await params
  const { email = '' } = await searchParams

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

  return (
    <>
      {/* Breadcrumbs */}
      <div className="py-6">
        <Breadcrumbs
          items={[
            { name: 'Orders', href: '/orders' },
            { name: `Order #${order.id}`, href: `/orders/${order.id}`, current: true },
          ]}
        />
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="max-w-xl">
          <p className="text-4xl font-bold tracking-tight text-foreground">Order #{order.id}</p>
          <p className="mt-2 text-base text-muted-foreground">
            Placed on{' '}
            <time dateTime={order.createdAt}>
              {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
            </time>
          </p>

          {statusDisplay && (
            <p className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
              {statusDisplay.text}
            </p>
          )}
        </div>

        <section aria-labelledby="order-heading" className="mt-10 border-t border-border">
          <h2 id="order-heading" className="sr-only">
            Your order
          </h2>

          <h3 className="sr-only">Items</h3>
          {order.items?.map((item, idx) => {
            const product = item.product as Product | undefined
            const image = product?.gallery?.[0]?.image as MediaType | undefined

            return (
              <div key={idx} className="flex space-x-6 border-b border-border py-10">
                <div className="size-20 sm:size-40 flex-none rounded-lg bg-muted overflow-hidden relative">
                  {image ? (
                    <Media fill imgClassName="size-full object-cover" resource={image} />
                  ) : (
                    <div className="size-full bg-muted" />
                  )}
                </div>
                <div className="flex flex-auto flex-col">
                  <div>
                    <h4 className="font-medium text-foreground">
                      {product?.slug ? (
                        <Link href={`/products/${product.slug}`} className="hover:text-secondary">
                          {product?.title || 'Product'}
                        </Link>
                      ) : (
                        product?.title || 'Product'
                      )}
                    </h4>
                    {item.variant && typeof item.variant === 'object' && item.variant.title && (
                      <p className="mt-1 text-sm text-muted-foreground">{item.variant.title}</p>
                    )}
                  </div>
                  <div className="mt-6 flex flex-1 items-end">
                    <dl className="flex divide-x divide-border text-sm">
                      <div className="flex pr-4 sm:pr-6">
                        <dt className="font-medium text-foreground">Quantity</dt>
                        <dd className="ml-2 text-muted-foreground">{item.quantity}</dd>
                      </div>
                      {product?.priceInGBP && (
                        <div className="flex pl-4 sm:pl-6">
                          <dt className="font-medium text-foreground">Price</dt>
                          <dd className="ml-2 text-muted-foreground">
                            <Price amount={product.priceInGBP} currencyCode={order.currency ?? undefined} />
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="sm:ml-40 sm:pl-6">
            <h3 className="sr-only">Your information</h3>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <>
                <h4 className="sr-only">Shipping address</h4>
                <dl className="grid grid-cols-1 gap-x-6 py-10 text-sm">
                  <div>
                    <dt className="font-medium text-foreground">Shipping address</dt>
                    <dd className="mt-2 text-muted-foreground">
                      <address className="not-italic">
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
                    </dd>
                  </div>
                </dl>
              </>
            )}

            {/* Order Summary */}
            <h3 className="sr-only">Summary</h3>
            <dl className="space-y-6 border-t border-border pt-10 text-sm">
              {typeof order.amount === 'number' && (
                <div className="flex justify-between">
                  <dt className="font-medium text-foreground">Total</dt>
                  <dd className="font-medium text-foreground">
                    <Price amount={order.amount} currencyCode={order.currency ?? undefined} />
                  </dd>
                </div>
              )}
              {typeof order.totalRefunded === 'number' && order.totalRefunded > 0 && (
                <div className="flex justify-between">
                  <dt className="font-medium text-foreground">Total Refunded</dt>
                  <dd className="text-green-600 dark:text-green-400">
                    -<Price amount={order.totalRefunded} currencyCode={order.currency ?? undefined} />
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </section>

        {/* Refund Section - only show for orders that can request refunds */}
        {order.status !== 'refunded' &&
         order.status !== 'partially_refunded' &&
         order.status !== 'cancelled' && (
          <section className="mt-10 border-t border-border pt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Refunds</h2>
              {!activeRefundRequest && (
                <RefundRequestForm order={order} userEmail={user?.email || order.customerEmail || undefined} />
              )}
            </div>

            {activeRefundRequest && (
              <div className="mt-6">
                <RefundStatus refundRequest={activeRefundRequest} />
              </div>
            )}

            {!activeRefundRequest && (
              <p className="mt-4 text-sm text-muted-foreground">No refund requests for this order.</p>
            )}
          </section>
        )}
      </div>
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
