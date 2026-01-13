'use client'

// Unified header actions that sync account and cart loading states
// Uses HeaderContext for synchronized loading between account menu and cart

import { UserIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { CartModal } from '@/components/Cart/CartModal'
import { useHeaderContext } from './HeaderContext'

export function HeaderActions() {
  // Use unified context for synchronized loading
  const { isLoading, user } = useHeaderContext()

  return (
    <div className="flex items-center gap-4">
      {/* Account Menu - show skeleton while loading */}
      {isLoading ? (
        <div className="size-6 rounded-full bg-muted animate-pulse" />
      ) : !user ? (
        <Link
          href="/login"
          className="text-sm font-semibold text-foreground hover:text-secondary transition-colors"
          aria-label="Log in"
        >
          Log in <span aria-hidden="true">&rarr;</span>
        </Link>
      ) : (
        <Menu as="div" className="relative">
          <MenuButton className="-m-1.5 flex items-center p-1.5 text-foreground hover:text-secondary transition-colors">
            <span className="sr-only">Open user menu</span>
            <UserIcon className="size-6" aria-hidden="true" />
          </MenuButton>
          <MenuItems
            transition
            className="absolute right-0 z-50 mt-2.5 w-40 origin-top-right rounded-md bg-background py-2 shadow-lg ring-1 ring-border transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <MenuItem>
              <Link
                href="/orders"
                className="block px-3 py-1 text-sm text-foreground data-[focus]:bg-muted"
              >
                Orders
              </Link>
            </MenuItem>
            <MenuItem>
              <Link
                href="/account"
                className="block px-3 py-1 text-sm text-foreground data-[focus]:bg-muted"
              >
                My Account
              </Link>
            </MenuItem>
            <div className="my-1 border-t border-border" />
            <MenuItem>
              <Link
                href="/logout"
                className="block px-3 py-1 text-sm text-foreground data-[focus]:bg-muted"
              >
                Log out
              </Link>
            </MenuItem>
          </MenuItems>
        </Menu>
      )}

      {/* Cart - pass unified loading state so both load together */}
      <CartModal externalLoading={isLoading} />
    </div>
  )
}
