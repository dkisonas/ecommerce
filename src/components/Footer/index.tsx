// TailwindPlus Component: Marketing.Page Sections.Footers.4-column simple
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { LogoIcon } from '@/components/icons/logo'

const { COMPANY_NAME, SITE_NAME } = process.env

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 2)()
  const menu = footer.navItems || []
  const currentYear = new Date().getFullYear()
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '')
  const copyrightName = COMPANY_NAME || SITE_NAME || ''

  return (
    <footer className="bg-background dark:bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <LogoIcon className="h-8 w-auto text-foreground" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Quality products, exceptional service.
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-12 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-3 md:gap-8">
              {/* Shop Column */}
              <div>
                <h3 className="text-sm font-semibold text-foreground">Shop</h3>
                <ul role="list" className="mt-4 space-y-3">
                  <li>
                    <Link
                      href="/products"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      All Products
                    </Link>
                  </li>
                  {menu.slice(0, 3).map((item) => (
                    <li key={item.id}>
                      <CMSLink
                        {...item.link}
                        appearance="link"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Account Column */}
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Account</h3>
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
                      href="/orders"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Orders
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support Column */}
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Support</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {menu.slice(3).map((item) => (
                    <li key={item.id}>
                      <CMSLink
                        {...item.link}
                        appearance="link"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      />
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/find-order"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Track Order
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {copyrightDate} {copyrightName}
              {copyrightName.length && !copyrightName.endsWith('.') ? '.' : ''} All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <ThemeSelector />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
