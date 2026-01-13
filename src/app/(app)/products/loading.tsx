import { Breadcrumbs } from '@/components/Breadcrumbs'

function ProductGridItemSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square w-full rounded-lg bg-muted" />
      {/* Text placeholders */}
      <div className="mt-4 flex justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
        <div className="h-4 w-12 rounded bg-muted" />
      </div>
    </div>
  )
}

function CategoryFilterSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-5 w-24 rounded bg-muted" />
      <div className="space-y-3">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-4 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="bg-background dark:bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="py-6">
          <Breadcrumbs items={[{ name: 'Products', href: '/products', current: true }]} />
        </div>

        {/* Page header */}
        <div className="pb-10 border-b border-border">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Shop All Products</h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">
            Browse our collection of quality products. Use filters to find exactly what you&apos;re
            looking for.
          </p>
        </div>

        {/* Main content with sidebar */}
        <div className="pt-12 pb-16 lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Sidebar filters skeleton */}
          <aside className="hidden lg:block">
            <CategoryFilterSkeleton />
          </aside>

          {/* Product grid area */}
          <div className="lg:col-span-3">
            {/* Sort bar skeleton */}
            <div className="flex items-center justify-end pb-6 border-b border-border">
              <div className="h-5 w-32 rounded bg-muted animate-pulse" />
            </div>

            {/* Products grid skeleton */}
            <div className="pt-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {Array(9)
                  .fill(0)
                  .map((_, index) => (
                    <ProductGridItemSkeleton key={index} />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
