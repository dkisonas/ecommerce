'use client'

// Error page styled to match 404 page
// Adapted for: React, Tailwind v4, dark mode support

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <main className="grid min-h-[80vh] place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-destructive">Error</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl">
          Something went wrong
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
          There was an issue with our storefront. This could be a temporary issue, please try again.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            onClick={() => reset()}
            className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-sm font-semibold text-foreground hover:text-secondary transition-colors"
          >
            Go back home <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
