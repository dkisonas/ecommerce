'use client'

// TailwindPlus Component: Marketing.Elements.Headers.Constrained
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import type { Header } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { LogoIcon } from '@/components/icons/logo'
import { HeaderActions } from './HeaderActions'
import { HeaderProvider, useHeaderContext } from './HeaderContext'
import { Cart } from '@/components/Cart'
import { cn } from '@/utilities/cn'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  return (
    <HeaderProvider>
      <HeaderContent header={header} />
    </HeaderProvider>
  )
}

function HeaderContent({ header }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const lastScrollY = useRef(0)
  const menu = header.navItems || []
  const router = useRouter()
  const { isLoading, user } = useHeaderContext()

  // Prevent scrolling when search is focused
  useEffect(() => {
    if (isSearchFocused) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSearchFocused])

  // Smart scroll behavior - hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollThreshold = 10 // Minimum scroll amount to trigger hide/show

      if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
        return
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down & past the header height - hide
        setIsHeaderVisible(false)
      } else {
        // Scrolling up - show
        setIsHeaderVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  return (
    <>
      {/* Search focus backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 dark:bg-black/50 z-30 transition-opacity duration-200',
          isSearchFocused ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        aria-hidden="true"
      />

      <header
        className={cn(
          'bg-background dark:bg-background sticky top-0 z-40 transition-transform duration-300',
          !isHeaderVisible && '-translate-y-full',
        )}
      >
      {/* Row 1: Main header with prominent search */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-8">
            {/* Logo - Left */}
            <Link href="/" className="shrink-0">
              <span className="sr-only">Store</span>
              <LogoIcon className="h-8 w-auto text-foreground" />
            </Link>

            {/* PROMINENT SEARCH BAR - Center (Desktop) */}
            <form onSubmit={handleSearch} className="hidden lg:block flex-1 max-w-xl">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full rounded-full border-2 border-border bg-white dark:bg-muted/20 py-3 pl-12 pr-28 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-secondary focus:outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 !shadow-none transition-colors appearance-none"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-secondary px-5 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Right side - Account & Cart (Desktop) / Menu button (Mobile) */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>

              {/* Desktop - Account & Cart (synced loading) */}
              <div className="hidden lg:flex items-center gap-4">
                <HeaderActions />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Navigation bar (desktop only) - Full width */}
      <nav aria-label="Main navigation" className="hidden lg:block border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex justify-center gap-x-10 py-3">
            {menu.map((item) => (
              <CMSLink
                key={item.id}
                {...item.link}
                size="clear"
                className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
                appearance="link"
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu dialog */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background p-6 sm:max-w-sm sm:ring-1 sm:ring-border">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
              <span className="sr-only">Store</span>
              <LogoIcon className="h-8 w-auto text-foreground" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-foreground"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md bg-muted/50 dark:bg-muted/30 py-2.5 pl-10 pr-4 text-base text-foreground placeholder:text-muted-foreground border-0 focus:ring-2 focus:ring-secondary focus:outline-none"
              />
            </div>
          </form>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-border">
              {/* Navigation links */}
              <div className="space-y-2 py-6">
                {menu.map((item) => (
                  <CMSLink
                    key={item.id}
                    {...item.link}
                    size="clear"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-muted"
                    appearance="link"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                ))}
              </div>

              {/* Account section */}
              <div className="py-6">
                {isLoading ? (
                  // Loading skeleton for mobile menu - synced with header
                  <div className="space-y-2">
                    <div className="-mx-3 px-3 py-2.5">
                      <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="-mx-3 px-3 py-2.5">
                      <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ) : user ? (
                  <div className="space-y-2">
                    <Link
                      href="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-muted"
                    >
                      Orders
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-foreground hover:bg-muted"
                    >
                      My Account
                    </Link>
                    <Link
                      href="/logout"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-foreground hover:bg-muted"
                    >
                      Log out
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-foreground hover:bg-muted"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/create-account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-secondary hover:bg-muted"
                    >
                      Create account <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Cart button in mobile */}
              <div className="py-6">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-foreground">Shopping Cart</span>
                  <Cart />
                </div>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
    </>
  )
}
