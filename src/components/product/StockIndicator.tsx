'use client'

// TailwindPlus styled stock indicator
// Adapted for: React, Tailwind v4, dark mode support

import { Product, Variant } from '@/payload-types'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

type Props = {
  product: Product
}

export const StockIndicator: React.FC<Props> = ({ product }) => {
  const searchParams = useSearchParams()

  const variants = product.variants?.docs || []

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')
      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }
        return String(variant) === variantId
      })

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [product.enableVariants, searchParams, variants])

  const stockQuantity = useMemo(() => {
    if (product.enableVariants) {
      if (selectedVariant) {
        return selectedVariant.inventory || 0
      }
    }
    return product.inventory || 0
  }, [product.enableVariants, selectedVariant, product.inventory])

  if (product.enableVariants && !selectedVariant) {
    return null
  }

  if (stockQuantity === 0 || !stockQuantity) {
    return (
      <p className="flex items-center text-sm text-destructive">
        <XMarkIcon className="mr-1.5 size-5 shrink-0" aria-hidden="true" />
        Out of stock
      </p>
    )
  }

  if (stockQuantity < 10) {
    return (
      <p className="flex items-center text-sm text-warning">
        <CheckIcon className="mr-1.5 size-5 shrink-0 text-secondary" aria-hidden="true" />
        Only {stockQuantity} left in stock
      </p>
    )
  }

  return (
    <p className="flex items-center text-sm text-muted-foreground">
      <CheckIcon className="mr-1.5 size-5 shrink-0 text-secondary" aria-hidden="true" />
      In stock
    </p>
  )
}
