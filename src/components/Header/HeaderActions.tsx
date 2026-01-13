'use client'

// Header actions - account menu and cart
// Uses server-provided user for instant render (no loading state)

import { useState, useEffect, useRef } from 'react'
import { UserIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CartModal } from '@/components/Cart/CartModal'
import { useAuth } from '@/providers/Auth'
import type { User } from '@/payload-types'

type Props = {
  user?: User | null
}

export function HeaderActions({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    router.push('/')
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className="flex items-center gap-4">
      {/* Account - custom dropdown to prevent re-render closing */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="-m-1.5 flex items-center p-1.5 text-foreground hover:text-secondary transition-colors"
        >
          <span className="sr-only">Open user menu</span>
          <UserIcon className="size-6" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-50 mt-2.5 w-40 origin-top-right rounded-md bg-background py-2 shadow-lg ring-1 ring-border">
            {user ? (
              // Logged in options
              <>
                <Link
                  href="/orders"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-1 text-sm text-foreground hover:bg-muted"
                >
                  Orders
                </Link>
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-1 text-sm text-foreground hover:bg-muted"
                >
                  My Account
                </Link>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-1 text-sm text-foreground hover:bg-muted"
                >
                  Log out
                </button>
              </>
            ) : (
              // Not logged in options
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-1 text-sm text-foreground hover:bg-muted"
                >
                  Log in
                </Link>
                <Link
                  href="/create-account"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-1 text-sm text-foreground hover:bg-muted"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Cart - always visible, manages its own loading for count badge */}
      <CartModal />
    </div>
  )
}
