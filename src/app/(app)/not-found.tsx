// TailwindPlus Component: Marketing.Feedback.404 Pages.Simple
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support

import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="grid min-h-[80vh] place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-secondary">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl">
          Page not found
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary transition-colors"
          >
            Go back home
          </Link>
          <Link
            href="/products"
            className="text-sm font-semibold text-foreground hover:text-secondary transition-colors"
          >
            Browse products <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
