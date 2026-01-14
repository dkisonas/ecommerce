'use client'

import type { Product } from '@/payload-types'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingCartIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import { toast } from 'sonner'

type Props = {
  product: Partial<Product> | null | undefined
}

export function QuickAddToCart({ product }: Props) {
  const { addItem } = useCart()
  const router = useRouter()

  const hasVariants = product?.enableVariants && (product?.variants?.docs?.length ?? 0) > 0

  const isOutOfStock = useMemo(() => {
    if (!product) return true
    if (hasVariants) {
      // For variant products, check if all variants are out of stock
      const variants = product.variants?.docs || []
      return variants.every((v) => {
        if (typeof v === 'object') {
          return (v.inventory ?? 0) <= 0
        }
        return false
      })
    }
    return (product.inventory ?? 0) <= 0
  }, [hasVariants, product])

  const addToCart = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (!product?.id) return

      addItem({
        product: product.id,
        variant: undefined,
      }).then(() => {
        toast.success('Added to cart')
      })
    },
    [addItem, product?.id],
  )

  const goToProduct = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!product?.slug) return
      router.push(`/products/${product.slug}`)
    },
    [router, product?.slug],
  )

  // Guard against null/undefined product - must be after all hooks
  if (!product || !product.id) {
    return null
  }

  // For products with variants, button to go to product page to select options
  if (hasVariants) {
    return (
      <button
        type="button"
        onClick={goToProduct}
        className="relative z-10 flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 transition-colors"
        aria-label="Select options"
        title="Select options"
      >
        <ShoppingCartIcon className="size-5" />
      </button>
    )
  }

  // For simple products, add directly to cart
  return (
    <button
      type="button"
      onClick={addToCart}
      disabled={isOutOfStock}
      className="relative z-10 flex size-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label={isOutOfStock ? 'Out of stock' : 'Add to cart'}
      title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
    >
      <ShoppingCartIcon className="size-5" />
    </button>
  )
}
