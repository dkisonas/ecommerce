'use client'

// TailwindPlus Component: Marketing.Elements.Headers.Constrained
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support
// Updated: Mobile two-row header with always-visible search, account dropdown, cart

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import type { Header, Setting, User } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo'
import { HeaderActions } from './HeaderActions'
import { CartModal } from '@/components/Cart/CartModal'
import { TrackOrderModal } from '@/components/TrackOrderModal'
import { cn } from '@/utilities/cn'
import { useAuth } from '@/providers/Auth'

type Props = {
  header: Header
  settings?: Setting | null
  user?: User | null
}

export function HeaderClient({ header, settings, user }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const lastScrollY = useRef(0)
  const menu = header.navItems || []
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await logout()
    router.push('/')
  }

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
      const scrollThreshold = 10

      if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
        return
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderVisible(false)
      } else {
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
        onClick={() => setIsSearchFocused(false)}
        aria-hidden="true"
      />

      <header
        className={cn(
          'bg-background dark:bg-background sticky top-0 z-40 transition-transform duration-300',
          !isHeaderVisible && '-translate-y-full',
        )}
      >
        {/* ========== MOBILE HEADER (Two Rows) ========== */}
        <div className="lg:hidden border-b border-border">
          {/* Mobile Row 1: Hamburger, Logo, Account Dropdown, Cart */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Hamburger + Logo */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex items-center justify-center rounded-md p-2 -ml-2 text-foreground hover:bg-muted transition-colors"
                  aria-label="Open menu"
                >
                  <Bars3Icon aria-hidden="true" className="size-6" />
                </button>
                <Link href="/" className="shrink-0">
                  <span className="sr-only">Store</span>
                  <Logo settings={settings} />
                </Link>
              </div>

              {/* Right: Account Dropdown + Cart */}
              <div className="flex items-center gap-1">
                {/* Account Dropdown - TailwindPlus: Application UI.Elements.Dropdowns.Simple */}
                <Menu as="div" className="relative">
                  <MenuButton className="inline-flex items-center justify-center rounded-md p-2.5 text-foreground hover:bg-muted transition-colors">
                    <span className="sr-only">Account menu</span>
                    <UserIcon className="size-6" aria-hidden="true" />
                  </MenuButton>

                  <MenuItems
                    transition
                    className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-lg bg-background dark:bg-card shadow-lg ring-1 ring-border transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
                    <div className="py-2">
                      {user ? (
                        <>
                          <MenuItem>
                            <Link
                              href="/orders"
                              className="block px-4 py-3 text-base font-medium text-foreground data-focus:bg-muted"
                            >
                              Orders
                            </Link>
                          </MenuItem>
                          <MenuItem>
                            <Link
                              href="/account"
                              className="block px-4 py-3 text-base font-medium text-foreground data-focus:bg-muted"
                            >
                              My Account
                            </Link>
                          </MenuItem>
                          <div className="my-2 border-t border-border" />
                          <MenuItem>
                            <button
                              onClick={handleLogout}
                              className="block w-full px-4 py-3 text-left text-base font-medium text-foreground data-focus:bg-muted"
                            >
                              Log out
                            </button>
                          </MenuItem>
                        </>
                      ) : (
                        <>
                          <MenuItem>
                            <Link
                              href="/login"
                              className="block px-4 py-3 text-base font-medium text-foreground data-focus:bg-muted"
                            >
                              Log in
                            </Link>
                          </MenuItem>
                          <MenuItem>
                            <Link
                              href="/create-account"
                              className="block px-4 py-3 text-base font-medium text-foreground data-focus:bg-muted"
                            >
                              Create account
                            </Link>
                          </MenuItem>
                          <div className="my-2 border-t border-border" />
                          <MenuItem>
                            <TrackOrderModal
                              trigger={
                                <span className="block px-4 py-3 text-base font-medium text-foreground data-focus:bg-muted cursor-pointer hover:bg-muted">
                                  Track order
                                </span>
                              }
                            />
                          </MenuItem>
                        </>
                      )}
                    </div>
                  </MenuItems>
                </Menu>

                {/* Cart button with badge */}
                <div className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted transition-colors">
                  <CartModal />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Row 2: Full-width Search Bar */}
          <div className="px-4 pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full rounded-full border-2 border-border bg-white dark:bg-muted/20 py-2.5 pl-4 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-secondary shadow-none transition-colors appearance-none"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center size-9 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors mr-0.5"
                  aria-label="Search"
                >
                  <MagnifyingGlassIcon className="size-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ========== DESKTOP HEADER ========== */}
        <div className="hidden lg:block border-b border-border">
          {/* Desktop Row 1: Logo, Search, Account/Cart */}
          <div className="mx-auto max-w-7xl px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-8">
              {/* Logo - Left */}
              <Link href="/" className="shrink-0">
                <span className="sr-only">Store</span>
                <Logo settings={settings} />
              </Link>

              {/* Search Bar - Center */}
              <form onSubmit={handleSearch} className="flex-1 max-w-xl">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full rounded-full border-2 border-border bg-white dark:bg-muted/20 py-2.5 pl-4 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-secondary shadow-none transition-colors appearance-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center size-9 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors mr-0.5"
                    aria-label="Search"
                  >
                    <MagnifyingGlassIcon className="size-5" />
                  </button>
                </div>
              </form>

              {/* Account & Cart - Right */}
              <div className="flex items-center gap-4 shrink-0">
                <HeaderActions user={user} />
              </div>
            </div>
          </div>

          {/* Desktop Row 2: Navigation */}
          <nav aria-label="Main navigation" className="bg-muted/30 dark:bg-muted/10">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
              <div className="flex justify-center gap-x-8 py-2.5">
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
        </div>

        {/* ========== MOBILE NAV DRAWER (CMS Links Only) ========== */}
        {/* TailwindPlus: Application UI.Navigation.Vertical Navigation.Simple */}
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-black/30 dark:bg-black/50" aria-hidden="true" />
          <DialogPanel className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-xs overflow-y-auto bg-background ring-1 ring-border shadow-xl">
            {/* Close button */}
            <div className="flex justify-end p-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-foreground hover:bg-muted transition-colors"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Navigation Links from CMS */}
            <nav aria-label="Mobile navigation" className="flex flex-1 flex-col px-4 pb-4">
              <ul role="list" className="space-y-1">
                {menu.map((item) => (
                  <li key={item.id}>
                    <CMSLink
                      {...item.link}
                      size="clear"
                      className="flex items-center justify-between rounded-md px-3 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors"
                      appearance="link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ChevronRightIcon className="size-5 text-muted-foreground" aria-hidden="true" />
                    </CMSLink>
                  </li>
                ))}
              </ul>
            </nav>
          </DialogPanel>
        </Dialog>
      </header>
    </>
  )
}
