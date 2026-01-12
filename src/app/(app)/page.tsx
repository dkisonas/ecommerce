// TailwindPlus styled homepage
// Adapted for: React, Tailwind v4, dark mode support

import type { Metadata } from 'next'
import { ProductGrid } from '@/components/ProductGrid'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to our store',
}

export default async function HomePage() {
  return (
    <div className="bg-background dark:bg-background">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Welcome to Our Store
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Discover our curated collection of quality products, crafted with care and designed to
            elevate your everyday.
          </p>
          <div className="mt-8">
            <Link
              href="/products"
              className="inline-block rounded-md bg-secondary px-8 py-3 text-base font-medium text-secondary-foreground shadow-sm hover:bg-secondary/90 transition-colors"
            >
              Shop All Products
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured Products</h2>
        <div className="mt-6">
          <ProductGrid limit={8} />
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
          >
            View all products <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
