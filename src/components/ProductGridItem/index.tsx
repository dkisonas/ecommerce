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

  const variants = product.variants?.docs

  if (variants && variants.length > 0) {
    const variant = variants[0]
    if (
      variant &&
      typeof variant === 'object' &&
      variant?.priceInGBP &&
      typeof variant.priceInGBP === 'number'
    ) {
      price = variant.priceInGBP
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
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted dark:bg-muted relative">
          {image?.url ? (
            <Image
              alt={image.alt || title || ''}
              src={image.url}
              width={400}
              height={400}
              className="size-full object-cover object-center group-hover:opacity-75 transition-opacity"
            />
          ) : (
            <div className="size-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          {/* Quick add button - appears on hover */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <QuickAddToCart product={product} />
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <div>
            <h3 className="text-sm text-foreground">
              <span aria-hidden="true" className="absolute inset-0" />
              {title}
            </h3>
            {category && <p className="mt-1 text-sm text-muted-foreground">{category}</p>}
          </div>
          {typeof price === 'number' && (
            <Price amount={price} className="text-sm font-medium text-foreground" />
          )}
        </div>
      </Link>
    </div>
  )
}
