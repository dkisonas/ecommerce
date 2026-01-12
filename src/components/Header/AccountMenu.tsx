'use client'

import { useAuth } from '@/providers/Auth'
import { User } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AccountMenu() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-black dark:text-white dark:hover:bg-neutral-800"
        aria-label="Log in"
      >
        <User className="h-4 w-4" />
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-black dark:text-white dark:hover:bg-neutral-800"
          aria-label="Account menu"
        >
          <User className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href="/orders" className="cursor-pointer">
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account" className="cursor-pointer">
            My Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/logout" className="cursor-pointer">
            Log out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
