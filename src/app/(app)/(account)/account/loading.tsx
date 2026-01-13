import { Breadcrumbs } from '@/components/Breadcrumbs'

function OrderItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="size-14 shrink-0 rounded-lg bg-muted" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
        </div>
        <div className="h-3 w-40 rounded bg-muted" />
      </div>
      <div className="size-5 rounded bg-muted" />
    </div>
  )
}

export default function Loading() {
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

      {/* Account Stats Skeleton */}
      <div className="my-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center animate-pulse">
          <div className="h-8 w-8 mx-auto rounded bg-muted" />
          <div className="h-4 w-12 mx-auto mt-1 rounded bg-muted" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center animate-pulse">
          <div className="h-8 w-20 mx-auto rounded bg-muted" />
          <div className="h-4 w-24 mx-auto mt-1 rounded bg-muted" />
        </div>
      </div>

      {/* Profile Section Skeleton */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Profile</h2>
        <div className="space-y-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Section Skeleton */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-foreground">Addresses</h2>
          <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="space-y-3 animate-pulse">
          {Array(2)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="mt-2 space-y-1">
                  <div className="h-3 w-48 rounded bg-muted" />
                  <div className="h-3 w-36 rounded bg-muted" />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Orders Skeleton */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
          <div className="h-5 w-16 rounded bg-muted animate-pulse" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <OrderItemSkeleton key={index} />
            ))}
        </div>
      </div>
    </>
  )
}
