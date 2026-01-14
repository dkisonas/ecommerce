// TailwindPlus styled homepage
// TailwindPlus: Marketing.Page Sections.Hero Sections.Simple centered with background image
// Adapted for: React, Tailwind v4, dark mode support

import type { Metadata } from 'next'
import { ProductGrid } from '@/components/ProductGrid'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to our store',
}

export default async function HomePage() {
  return (
    <div className="bg-background dark:bg-background">
      {/* Hero Section - Full-width with background image */}
      <div className="relative isolate overflow-hidden">
        {/* Background Image with overlay */}
        <img
          alt=""
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          className="absolute inset-0 -z-10 size-full object-cover brightness-50"
        />
        {/* Additional gradient overlay for better text readability */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-24 sm:py-32 lg:py-40">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Discover Your Style
              </h1>
              <p className="mt-6 text-lg text-gray-200 sm:text-xl">
                Explore our curated collection of premium products, crafted with care and designed
                to elevate your everyday.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-4">
                <Button asChild variant="secondary" size="lg">
                  <Link href="/products">Shop Now</Link>
                </Button>
                <Link
                  href="/products"
                  className="text-sm font-semibold text-white hover:text-gray-200 transition-colors"
                >
                  Browse Collection <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
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
