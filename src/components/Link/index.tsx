import type { Category, Page, Product } from '@/payload-types'

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import React from 'react'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  // Legacy reference type (for blocks like CallToAction)
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Product | string | number
  } | null
  // New navigation link types
  type?: 'custom' | 'reference' | 'system' | 'category' | 'page' | null
  systemPage?: '/' | '/products' | null
  category?: number | Category | null
  page?: number | Page | null
  url?: string | null
  size?: ButtonProps['size'] | null
}

function resolveHref(props: CMSLinkType): string | null {
  const { type, systemPage, category, page, reference, url } = props

  switch (type) {
    case 'system':
      return systemPage || null

    case 'category':
      if (typeof category === 'object' && category?.slug) {
        return `/products?category=${category.slug}`
      }
      return null

    case 'page':
      if (typeof page === 'object' && page?.slug) {
        return `/${page.slug}`
      }
      return null

    case 'custom':
      return url || null

    // Legacy reference type (for backwards compatibility)
    case 'reference':
      if (typeof reference?.value === 'object' && reference.value.slug) {
        return reference.relationTo !== 'pages'
          ? `/${reference.relationTo}/${reference.value.slug}`
          : `/${reference.value.slug}`
      }
      return null

    default:
      // Fallback: if url is provided, use it
      return url || null
  }
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const { appearance = 'inline', children, className, label, newTab, size: sizeFromProps } = props

  const href = resolveHref(props)

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <Link className={cn(className)} href={href} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
