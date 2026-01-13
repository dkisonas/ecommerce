import { Breadcrumbs } from '@/components/Breadcrumbs'

function GallerySkeleton() {
  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="aspect-square w-full rounded-lg bg-muted animate-pulse" />
      {/* Thumbnails */}
      <div className="flex gap-2">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="size-16 rounded-md bg-muted animate-pulse" />
          ))}
      </div>
    </div>
  )
}

function ProductDescriptionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title */}
      <div className="h-8 w-3/4 rounded bg-muted" />
      {/* Price */}
      <div className="h-6 w-24 rounded bg-muted" />
      {/* Description */}
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
      {/* Variant selector placeholder */}
      <div className="space-y-3 pt-4">
        <div className="h-5 w-16 rounded bg-muted" />
        <div className="flex gap-2">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-10 w-16 rounded-md bg-muted" />
            ))}
        </div>
      </div>
      {/* Add to cart button */}
      <div className="h-12 w-full rounded-md bg-muted mt-6" />
    </div>
  )
}

function ProductGridItemSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square w-full rounded-lg bg-muted" />
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

export default function Loading() {
  return (
    <div className="bg-background dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        {/* Breadcrumbs skeleton */}
        <div className="py-6">
          <Breadcrumbs
            items={[
              { name: 'Products', href: '/products' },
              { name: 'Loading...', href: '#', current: true },
            ]}
          />
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image gallery skeleton */}
          <GallerySkeleton />

          {/* Product info skeleton */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <ProductDescriptionSkeleton />
          </div>
        </div>
      </div>

      {/* Related products skeleton */}
      <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-8 mt-16">
        <div className="h-8 w-48 rounded bg-muted animate-pulse mb-6" />
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <ProductGridItemSkeleton key={index} />
            ))}
        </div>
      </div>
    </div>
  )
}
