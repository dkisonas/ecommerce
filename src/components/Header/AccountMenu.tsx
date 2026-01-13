'use client'

// TailwindPlus styled account menu
// Adapted for: React, Tailwind v4, dark mode support

import { useAuth } from '@/providers/Auth'
import { UserIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

export function AccountMenu() {
  const { user, status } = useAuth()

  // Show skeleton while auth status is loading
  if (status === undefined) {
    return (
      <div className="flex items-center">
        <div className="size-6 rounded-full bg-muted animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm font-semibold text-foreground hover:text-secondary transition-colors"
        aria-label="Log in"
      >
        Log in <span aria-hidden="true">&rarr;</span>
      </Link>
    )
  }

  return (
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
  )
}
