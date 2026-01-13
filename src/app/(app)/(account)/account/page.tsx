// TailwindPlus Component: Application UI.Headings.Page Headings.Card with avatar and stats
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support

import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { Order, Media as MediaType, Product } from '@/payload-types'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Price } from '@/components/Price'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { AddressListing } from '@/components/addresses/AddressListing'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import {
  ShoppingBagIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

// Status display helper
function getStatusDisplay(status: string) {
  switch (status) {
    case 'completed':
      return { text: 'Delivered', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' }
    case 'processing':
      return { text: 'Processing', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' }
    case 'pending':
      return { text: 'Pending', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-500/10' }
    case 'refund_requested':
      return { text: 'Refund Requested', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' }
    case 'refunded':
      return { text: 'Refunded', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-500/10' }
    case 'partially_refunded':
      return { text: 'Partially Refunded', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-500/10' }
    case 'cancelled':
      return { text: 'Cancelled', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' }
    default:
      return { text: status, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-500/10' }
  }
}

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Please login to access your account.')}`,
    )
  }

  // Fetch orders with count
  let orders: Order[] = []
  let totalOrders = 0

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 3,
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
    totalOrders = ordersResult?.totalDocs || 0
  } catch (error) {
    // Silently handle error
  }

  return (
    <>
      {/* Breadcrumbs */}
      <div className="py-6">
        <Breadcrumbs items={[{ name: 'Account', href: '/account', current: true }]} />
      </div>

      {/* Welcome Header */}
      <div className="pb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Account</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, addresses, and view your orders.
        </p>
      </div>

      {/* Account Stats */}
      <div className="my-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
          <p className="text-sm text-muted-foreground">{totalOrders === 1 ? 'Order' : 'Orders'}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {formatDateTime({ date: user.createdAt, format: 'MMM yyyy' })}
          </p>
          <p className="text-sm text-muted-foreground">Member since</p>
        </div>
      </div>

      {/* Profile Section - Compact */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Profile</h2>
        <ProfileCard />
      </div>

      {/* Addresses Section - Separate */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-foreground">Addresses</h2>
          <CreateAddressModal />
        </div>
        <AddressListing />
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
          {totalOrders > 0 && (
            <Link
              href="/orders"
              className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
            >
              View all
            </Link>
          )}
        </div>

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
                      <Media
                        fill
                        imgClassName="size-full object-cover"
                        resource={image}
                      />
                    ) : (
                      <div className="size-full bg-muted flex items-center justify-center">
                        <ShoppingBagIcon className="size-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Order #{order.id}
                      </p>
                      {statusDisplay && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
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
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Manage your account settings and view orders.',
  openGraph: mergeOpenGraph({
    title: 'My Account',
    url: '/account',
  }),
  title: 'My Account',
}
