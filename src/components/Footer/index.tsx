// TailwindPlus Component: Marketing.Page Sections.Footers.4-column simple
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support

import type { Footer as FooterType, Setting } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { FooterAccountLinks } from './FooterAccountLinks'
import { FooterLogo } from './FooterLogo'
import { SocialIcon } from './SocialIcon'

export async function Footer() {
  const [footer, settings] = await Promise.all([
    getCachedGlobal('footer', 2)() as Promise<FooterType>,
    getCachedGlobal('settings', 2)() as Promise<Setting>,
  ])
  const columns = footer.columns || []
  const legacyMenu = footer.navItems || []
  const socialLinks = footer.showSocialLinks ? footer.socialLinks || [] : []
  const currentYear = new Date().getFullYear()
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '')
  const copyrightName = settings?.companyName || settings?.siteName || ''
  const tagline = settings?.tagline || 'Quality products, exceptional service.'

  // Determine column count for grid layout
  const hasColumns = columns.length > 0
  const columnCount = hasColumns ? columns.length + 1 : 2 // +1 for Account column
  const gridCols =
    columnCount === 2
      ? 'md:grid-cols-2'
      : columnCount === 3
        ? 'md:grid-cols-3'
        : columnCount === 4
          ? 'md:grid-cols-4'
          : 'md:grid-cols-2'

  return (
    <footer className="bg-background dark:bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo and tagline */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <FooterLogo settings={settings} />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">{tagline}</p>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-4 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.platform}
                  >
                    <SocialIcon platform={social.platform} className="size-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation columns */}
          <div className="mt-12 xl:col-span-2 xl:mt-0">
            <div className={`md:grid ${gridCols} md:gap-8`}>
              {hasColumns ? (
                // New columns structure
                <>
                  {columns.map((column) => (
                    <div key={column.id} className="mt-10 first:mt-0 md:mt-0">
                      <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
                      <ul role="list" className="mt-4 space-y-3">
                        {column.links?.map((item) => (
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
                  ))}
                  {/* Account Column - Always shown */}
                  <div className="mt-10 md:mt-0">
                    <h3 className="text-sm font-semibold text-foreground">Account</h3>
                    <FooterAccountLinks />
                  </div>
                </>
              ) : (
                // Legacy structure (fallback)
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Shop</h3>
                    <ul role="list" className="mt-4 space-y-3">
                      {legacyMenu.map((item) => (
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
                  <div className="mt-10 md:mt-0">
                    <h3 className="text-sm font-semibold text-foreground">Account</h3>
                    <FooterAccountLinks />
                  </div>
                </>
              )}
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
            {settings?.enableDarkMode !== false && (
              <div className="flex items-center gap-4">
                <ThemeSelector />
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
