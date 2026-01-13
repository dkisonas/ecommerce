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
import { FooterAccountLinks } from './FooterAccountLinks'

const { COMPANY_NAME, SITE_NAME } = process.env

export async function Footer() {
  const footer: Footer = await getCachedGlobal('footer', 2)()
  const menu = footer.navItems || []
  const currentYear = new Date().getFullYear()
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '')
  const copyrightName = COMPANY_NAME || SITE_NAME || ''

  return (
    <footer className="bg-background dark:bg-background border-t border-border">
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
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* Shop Column - Categories from CMS */}
              <div>
                <h3 className="text-sm font-semibold text-foreground">Shop</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {menu.map((item) => (
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

              {/* Account Column - Dynamic based on auth */}
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Account</h3>
                <FooterAccountLinks />
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
