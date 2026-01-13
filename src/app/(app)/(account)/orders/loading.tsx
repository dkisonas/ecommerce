import { Breadcrumbs } from '@/components/Breadcrumbs'

function OrderItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      {/* Product image */}
      <div className="size-14 shrink-0 rounded-lg bg-muted" />
      {/* Order info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
        </div>
        <div className="h-3 w-40 rounded bg-muted" />
      </div>
      {/* Chevron */}
      <div className="size-5 rounded bg-muted" />
    </div>
  )
}

export default function Loading() {
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

      {/* Orders List Skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <OrderItemSkeleton key={index} />
          ))}
      </div>
    </>
  )
}
