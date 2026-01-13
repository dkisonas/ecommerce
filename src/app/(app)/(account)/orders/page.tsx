// TailwindPlus Component: Ecommerce.Page Examples.Order History Pages.With invoice list
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support

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

// Status display helper
function getStatusDisplay(status: string) {
  switch (status) {
    case 'completed':
      return { text: 'Delivered', color: 'text-green-600 dark:text-green-400' }
    case 'processing':
      return { text: 'Processing', color: 'text-secondary' }
    case 'pending':
      return { text: 'Pending', color: 'text-muted-foreground' }
    case 'refund_requested':
      return { text: 'Refund Requested', color: 'text-amber-600 dark:text-amber-400' }
    case 'refunded':
      return { text: 'Refunded', color: 'text-muted-foreground' }
    case 'partially_refunded':
      return { text: 'Partially Refunded', color: 'text-muted-foreground' }
    case 'cancelled':
      return { text: 'Cancelled', color: 'text-muted-foreground' }
    default:
      return { text: status, color: 'text-muted-foreground' }
  }
}

export default async function Orders() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  let orders: Order[] | null = null

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your orders.')}`)
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (error) {}

  return (
    <>
      {/* Breadcrumbs */}
      <div className="py-6">
        <Breadcrumbs items={[{ name: 'Orders', href: '/orders', current: true }]} />
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Order history</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Check the status of recent orders, manage returns, and view order details.
          </p>
        </div>

        <section aria-labelledby="recent-heading" className="mt-16">
          <h2 id="recent-heading" className="sr-only">Recent orders</h2>

          {(!orders || !Array.isArray(orders) || orders?.length === 0) ? (
            <div className="text-center py-16 bg-muted/30 dark:bg-muted/10 rounded-lg">
              <p className="text-muted-foreground">You have no orders yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                When you make a purchase, your orders will appear here.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-block rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-16 sm:space-y-24">
              {orders.map((order) => {
                const statusDisplay = order.status ? getStatusDisplay(order.status) : null

                return (
                <div key={order.id}>
                  <h3 className="sr-only">
                    Order placed on <time dateTime={order.createdAt}>{formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}</time>
                  </h3>

                  {/* Order header */}
                  <div className="bg-muted/30 dark:bg-muted/10 px-4 py-6 sm:rounded-lg sm:p-6 md:flex md:items-center md:justify-between md:space-x-6 lg:space-x-8">
                    <dl className="flex-auto divide-y divide-border text-sm text-muted-foreground md:grid md:grid-cols-4 md:gap-x-6 md:divide-y-0 lg:w-2/3 lg:flex-none lg:gap-x-8">
                      <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                        <dt className="font-medium text-foreground">Order number</dt>
                        <dd className="md:mt-1">#{order.id}</dd>
                      </div>
                      <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                        <dt className="font-medium text-foreground">Date placed</dt>
                        <dd className="md:mt-1">
                          <time dateTime={order.createdAt}>
                            {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
                          </time>
                        </dd>
                      </div>
                      {typeof order.amount === 'number' && (
                        <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                          <dt className="font-medium text-foreground">Total amount</dt>
                          <dd className="font-medium text-foreground md:mt-1">
                            <Price amount={order.amount} currencyCode={order.currency ?? undefined} />
                          </dd>
                        </div>
                      )}
                      {statusDisplay && (
                        <div className="max-md:flex max-md:justify-between max-md:py-4 max-md:first:pt-0 max-md:last:pb-0">
                          <dt className="font-medium text-foreground">Status</dt>
                          <dd className={`md:mt-1 font-medium ${statusDisplay.color}`}>
                            {statusDisplay.text}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <div className="mt-6 space-y-4 sm:flex sm:space-y-0 sm:space-x-4 md:mt-0">
                      <Link
                        href={`/orders/${order.id}`}
                        className="flex w-full items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:outline-none md:w-auto"
                      >
                        View Order
                        <span className="sr-only">#{order.id}</span>
                      </Link>
                    </div>
                  </div>

                  {/* Products list */}
                  <div className="mt-6 flow-root px-4 sm:mt-10 sm:px-0">
                    <div className="-my-6 divide-y divide-border sm:-my-10">
                      {order.items?.map((item, idx) => {
                        const product = item.product as Product | undefined
                        const image = product?.gallery?.[0]?.image as MediaType | undefined

                        return (
                          <div key={idx} className="flex py-6 sm:py-10">
                            <div className="min-w-0 flex-1 lg:flex lg:flex-col">
                              <div className="lg:flex-1">
                                <div className="sm:flex">
                                  <div>
                                    <h4 className="font-medium text-foreground">
                                      {product?.title || 'Product'}
                                    </h4>
                                    {item.variant && typeof item.variant === 'object' && item.variant.title && (
                                      <p className="mt-1 text-sm text-muted-foreground">
                                        {item.variant.title}
                                      </p>
                                    )}
                                  </div>
                                  {product?.priceInGBP && (
                                    <p className="mt-1 font-medium text-foreground sm:mt-0 sm:ml-6">
                                      <Price amount={product.priceInGBP} currencyCode={order.currency ?? undefined} />
                                      {item.quantity > 1 && (
                                        <span className="text-muted-foreground font-normal"> x {item.quantity}</span>
                                      )}
                                    </p>
                                  )}
                                </div>
                                {product?.slug && (
                                  <div className="mt-2 flex text-sm font-medium sm:mt-4">
                                    <Link href={`/products/${product.slug}`} className="text-secondary hover:text-secondary/80">
                                      View Product
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ml-4 shrink-0 sm:order-first sm:m-0 sm:mr-6">
                              <div className="size-20 sm:size-40 lg:size-52 rounded-lg bg-muted overflow-hidden relative">
                                {image ? (
                                  <Media
                                    fill
                                    imgClassName="size-full object-cover"
                                    resource={image}
                                  />
                                ) : (
                                  <div className="size-full bg-muted" />
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </section>
      </div>
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
