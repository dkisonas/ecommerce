'use client'

import type { Product } from '@/payload-types'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingCartIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import React, { useCallback, useMemo } from 'react'
import { toast } from 'sonner'

type Props = {
  product: Partial<Product>
}

export function QuickAddToCart({ product }: Props) {
  const { addItem, cart } = useCart()

  const hasVariants = product.enableVariants && (product.variants?.docs?.length ?? 0) > 0

  const isOutOfStock = useMemo(() => {
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
  }, [hasVariants, product.variants?.docs, product.inventory])

  const itemInCart = useMemo(() => {
    if (hasVariants) return null

    return cart?.items?.find((item) => {
      const productID = typeof item.product === 'object' ? item.product?.id : item.product
      return productID === product.id
    })
  }, [cart?.items, product.id, hasVariants])

  const quantityInCart = itemInCart?.quantity || 0

  const addToCart = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (!product.id) return

      addItem({
        product: product.id,
        variant: undefined,
      }).then(() => {
        toast.success('Added to cart')
      })
    },
    [addItem, product.id],
  )

  // For products with variants, link to product page to select options
  if (hasVariants) {
    return (
      <Link
        href={`/products/${product.slug}`}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 transition-colors"
        aria-label="Select options"
        title="Select options"
      >
        <ShoppingCartIcon className="size-5" />
      </Link>
    )
  }

  // For simple products, add directly to cart
  return (
    <div className="relative z-10">
      <button
        type="button"
        onClick={addToCart}
        disabled={isOutOfStock}
        className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label={isOutOfStock ? 'Out of stock' : 'Add to cart'}
        title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
      >
        <ShoppingCartIcon className="size-5" />
      </button>
      {quantityInCart > 0 && (
        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium">
          {quantityInCart}
        </span>
      )}
    </div>
  )
}
