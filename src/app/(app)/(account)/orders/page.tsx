import type { Order, Media as MediaType, Product } from '@/payload-types'
import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Price } from '@/components/Price'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ShoppingBagIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

// Status display helper
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

export default async function Orders() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?redirect=/orders`)
  }

  let orders: Order[] = []

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      sort: '-createdAt',
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (_error) {
    // Silently handle error
  }

  return (
    <>
      {/* Breadcrumbs */}
      <div className="py-6">
        <Breadcrumbs items={[{ name: 'Orders', href: '/orders', current: true }]} />
      </div>

      {/* Page Header */}
      <div className="pb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Order History</h1>
        <p className="mt-1 text-muted-foreground">
          Check the status of your orders and view order details.
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <ShoppingBagIcon className="mx-auto size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-sm font-medium text-foreground">No orders yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            When you make a purchase, your orders will appear here.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border">
          {orders.map((order) => {
            const firstItem = order.items?.[0]
            const product = firstItem?.product as Product | undefined
            const image = product?.gallery?.[0]?.image as MediaType | undefined
            const statusDisplay = order.status ? getStatusDisplay(order.status) : null
            const itemsCount = order.items?.length || 0

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                {/* Product image */}
                <div className="size-14 shrink-0 rounded-lg bg-muted overflow-hidden relative">
                  {image ? (
                    <Media fill imgClassName="size-full object-cover" resource={image} />
                  ) : (
                    <div className="size-full bg-muted flex items-center justify-center">
                      <ShoppingBagIcon className="size-6 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Order info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Order #{order.id}</p>
                    {statusDisplay && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}
                      >
                        {statusDisplay.text}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatDateTime({ date: order.createdAt, format: 'MMM dd, yyyy' })}
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

                <ChevronRightIcon className="size-5 text-muted-foreground shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}

export const metadata: Metadata = {
  description: 'Your orders.',
  openGraph: mergeOpenGraph({
    title: 'Orders',
    url: '/orders',
  }),
  title: 'Orders',
}
