'use client'

import Link from 'next/link'
import { useAuth } from '@/providers/Auth'

export function FooterAccountLinks() {
  const { user, status } = useAuth()

  // Show logged-in links when user is authenticated
  if (user || status === 'loggedIn') {
    return (
      <ul role="list" className="mt-4 space-y-3">
        <li>
          <Link
            href="/account"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            My Account
          </Link>
        </li>
        <li>
          <Link
            href="/orders"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Orders
          </Link>
        </li>
        <li>
          <Link
            href="/logout"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign Out
          </Link>
        </li>
      </ul>
    )
  }

  // Show loading placeholder while auth state is being determined
  // (status is undefined during initial load)
  if (status === undefined && user === undefined) {
    return (
      <ul role="list" className="mt-4 space-y-3">
        <li>
          <span className="text-sm text-muted-foreground">My Account</span>
        </li>
        <li>
          <span className="text-sm text-muted-foreground">Orders</span>
        </li>
      </ul>
    )
  }

  // Show logged-out links
  return (
    <ul role="list" className="mt-4 space-y-3">
      <li>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign In
        </Link>
      </li>
      <li>
        <Link
          href="/create-account"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Create Account
        </Link>
      </li>
      <li>
        <Link
          href="/track-order"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Track Order
        </Link>
      </li>
    </ul>
  )
}
