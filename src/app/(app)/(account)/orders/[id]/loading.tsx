import { Breadcrumbs } from '@/components/Breadcrumbs'

function OrderItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      {/* Product image */}
      <div className="size-16 shrink-0 rounded-lg bg-muted" />
      {/* Product info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
      {/* Price */}
      <div className="h-4 w-16 rounded bg-muted" />
    </div>
  )
}

export default function Loading() {
  return (
    <>
      {/* Breadcrumbs */}
      <div className="py-6">
        <Breadcrumbs
          items={[
            { name: 'Orders', href: '/orders' },
            { name: 'Loading...', href: '#', current: true },
          ]}
        />
      </div>

      {/* Page Header Skeleton */}
      <div className="pb-8 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-6 w-24 rounded-full bg-muted" />
        </div>
        <div className="mt-2 h-5 w-64 rounded bg-muted" />
      </div>

      {/* Order Items Card Skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <OrderItemSkeleton key={index} />
            ))}
        </div>
      </div>

      {/* Shipping & Summary Skeleton */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {/* Shipping Address */}
        <div className="rounded-xl border border-border bg-card p-4 animate-pulse">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-40 rounded bg-muted" />
            <div className="h-3 w-48 rounded bg-muted" />
            <div className="h-3 w-36 rounded bg-muted" />
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-border bg-card p-4 animate-pulse">
          <div className="h-4 w-28 rounded bg-muted" />
          <div className="mt-3 space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-12 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
