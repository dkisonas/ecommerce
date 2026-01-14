'use client'

// TailwindPlus styled Add to Cart button
// Adapted for: React, Tailwind v4, dark mode support

import type { Product, Variant } from '@/payload-types'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import { toast } from 'sonner'

type Props = {
  product: Product | null | undefined
}

export function AddToCart({ product }: Props) {
  const { addItem, cart } = useCart()
  const searchParams = useSearchParams()

  // Filter out null/undefined variants
  const variants = (product?.variants?.docs || []).filter(
    (v): v is Variant => v !== null && v !== undefined && typeof v === 'object' && typeof v.id === 'number'
  )

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (!product) return undefined
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')
      if (!variantId) return undefined

      const validVariant = variants.find((variant) => String(variant.id) === variantId)
      return validVariant
    }

    return undefined
  }, [product, searchParams, variants])

  const addToCart = useCallback(
    (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (!product?.id) return

      // Only pass variant ID if it's a valid number
      const variantId = selectedVariant?.id
      const validVariantId = typeof variantId === 'number' ? variantId : undefined

      addItem({
        product: product.id,
        variant: validVariantId,
      }).then(() => {
        toast.success('Item added to cart.')
      })
    },
    [addItem, product?.id, selectedVariant],
  )

  const disabled = useMemo<boolean>(() => {
    if (!product?.id) return true

    // Filter out any null/undefined cart items
    const validCartItems = (cart?.items || []).filter(
      (item) => item && item.product
    )

    const existingItem = validCartItems.find((item) => {
      const productID = typeof item.product === 'object' ? item.product?.id : item.product
      const variantID = item.variant
        ? typeof item.variant === 'object'
          ? item.variant?.id
          : item.variant
        : undefined

      if (productID === product.id) {
        if (product.enableVariants) {
          return variantID === selectedVariant?.id
        }
        return true
      }
    })

    if (existingItem) {
      const existingQuantity = existingItem.quantity

      if (product.enableVariants) {
        return existingQuantity >= (selectedVariant?.inventory || 0)
      }
      return existingQuantity >= (product.inventory || 0)
    }

    if (product.enableVariants) {
      if (!selectedVariant) {
        return true
      }

      if (selectedVariant.inventory === 0) {
        return true
      }
    } else {
      if (product.inventory === 0) {
        return true
      }
    }

    return false
  }, [selectedVariant, cart?.items, product])

  // Guard after all hooks
  if (!product || !product.id) {
    return null
  }

  return (
    <button
      type="button"
      aria-label="Add to cart"
      disabled={disabled}
      onClick={addToCart}
      className="flex max-w-xs flex-1 items-center justify-center rounded-md bg-secondary px-8 py-3 text-base font-medium text-secondary-foreground shadow-sm hover:bg-secondary/90 focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:w-full"
    >
      {disabled && product.enableVariants && !selectedVariant
        ? 'Select options'
        : disabled
          ? 'Out of stock'
          : 'Add to cart'}
    </button>
  )
}
