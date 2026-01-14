// TailwindPlus Component: Ecommerce.Components.Product Lists.With inline price
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support (manually added)

import type { Product } from '@/payload-types'
import { Price } from '@/components/Price'
import { QuickAddToCart } from '@/components/Cart/QuickAddToCart'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { gallery, priceInGBP, title, slug } = product

  let price = priceInGBP
  let hasVariants = false

  const variants = product.variants?.docs

  // For products with variants, find the lowest price
  if (product.enableVariants && variants && variants.length > 0) {
    hasVariants = true
    const variantPrices = variants
      .filter((v) => v && typeof v === 'object' && typeof v.priceInGBP === 'number')
      .map((v) => (v as { priceInGBP: number }).priceInGBP)
      .sort((a, b) => a - b)

    if (variantPrices.length > 0) {
      price = variantPrices[0] // Lowest price
    }
  }

  const galleryImage = gallery?.[0]?.image
  const image =
    galleryImage && typeof galleryImage === 'object' && 'url' in galleryImage ? galleryImage : null

  // Get category name if available
  const category =
    product.categories && product.categories.length > 0
      ? typeof product.categories[0] === 'object'
        ? product.categories[0].title
        : null
      : null

  return (
    <div className="group relative">
      <Link href={`/products/${slug}`} className="block">
        {/* Taller cards on mobile with aspect-[4/5], square on larger screens */}
        <div className="aspect-[4/5] sm:aspect-square w-full overflow-hidden rounded-lg bg-muted dark:bg-muted relative">
          {image?.url ? (
            <Image
              alt={image.alt || title || ''}
              src={image.url}
              width={400}
              height={500}
              className="size-full object-cover object-center group-hover:opacity-75 transition-opacity"
            />
          ) : (
            <div className="size-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {/* Quick add button - always visible on mobile, hover on desktop */}
          <div className="absolute bottom-3 right-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <QuickAddToCart product={product} />
          </div>
        </div>
        <div className="mt-3 flex justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm text-foreground truncate">
              <span aria-hidden="true" className="absolute inset-0" />
              {title}
            </h3>
            {category && <p className="mt-0.5 text-xs text-muted-foreground truncate">{category}</p>}
          </div>
          {typeof price === 'number' && (
            <Price
              amount={price}
              showFrom={hasVariants}
              className="text-sm font-medium text-foreground shrink-0"
            />
          )}
        </div>
      </Link>
    </div>
  )
}
