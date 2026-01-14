'use client'

// TailwindPlus Component: Ecommerce.Components.Product Overviews.With image gallery and expandable details
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support (manually added)

import type { Product, Variant, Setting } from '@/payload-types'
import { RichText } from '@/components/RichText'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import React, { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

import { VariantSelector } from './VariantSelector'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'

type ProductDescriptionProps = {
  product: Product
  settings?: Setting | null
}

export function ProductDescription({ product, settings }: ProductDescriptionProps) {
  const { currency } = useCurrency()
  const searchParams = useSearchParams()
  const selectedVariantId = searchParams.get('variant')

  const priceField = `priceIn${currency.code}` as keyof Product
  const variantPriceField = `priceIn${currency.code}` as keyof Variant
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  // Calculate price display based on variants and selection
  const priceDisplay = useMemo(() => {
    if (!hasVariants) {
      // Simple product - just show the price
      const price = product[priceField]
      if (typeof price === 'number') {
        return { type: 'single' as const, amount: price }
      }
      return { type: 'single' as const, amount: 0 }
    }

    // Product with variants
    const variants = product.variants?.docs?.filter(
      (v): v is Variant => v !== null && typeof v === 'object',
    )

    if (!variants?.length) {
      return { type: 'single' as const, amount: 0 }
    }

    // If a variant is selected, show that variant's price
    if (selectedVariantId) {
      const selectedVariant = variants.find((v) => String(v.id) === selectedVariantId)
      if (selectedVariant) {
        const price = selectedVariant[variantPriceField]
        if (typeof price === 'number') {
          return { type: 'single' as const, amount: price }
        }
      }
    }

    // No variant selected - show price range
    const prices = variants
      .map((v) => v[variantPriceField])
      .filter((p): p is number => typeof p === 'number')
      .sort((a, b) => a - b)

    if (prices.length === 0) {
      return { type: 'single' as const, amount: 0 }
    }

    const lowestAmount = prices[0]
    const highestAmount = prices[prices.length - 1]

    if (lowestAmount === highestAmount) {
      return { type: 'single' as const, amount: lowestAmount }
    }

    return { type: 'range' as const, lowestAmount, highestAmount }
  }, [hasVariants, product, priceField, selectedVariantId, variantPriceField])

  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.title}</h1>

      {/* Price */}
      <div className="mt-3">
        <h2 className="sr-only">Product information</h2>
        <p className="text-3xl tracking-tight text-foreground">
          {priceDisplay.type === 'range' ? (
            <Price highestAmount={priceDisplay.highestAmount} lowestAmount={priceDisplay.lowestAmount} />
          ) : (
            <Price amount={priceDisplay.amount} />
          )}
        </p>
      </div>

      {/* Stock indicator */}
      <div className="mt-3">
        <Suspense fallback={null}>
          <StockIndicator product={product} />
        </Suspense>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-6">
          <h3 className="sr-only">Description</h3>
          <div className="space-y-6 text-base text-muted-foreground">
            <RichText data={product.description} enableGutter={false} />
          </div>
        </div>
      )}

      {/* Variant selector */}
      {hasVariants && (
        <div className="mt-6">
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>
        </div>
      )}

      {/* Add to cart */}
      <div className="mt-10 flex">
        <Suspense fallback={null}>
          <AddToCart product={product} />
        </Suspense>
      </div>

      {/* Shipping & Returns - Always visible like major ecommerce sites */}
      <div className="mt-8 space-y-4 border-t border-border pt-6">
        {/* Shipping highlights */}
        <div className="flex items-start gap-3">
          <svg className="size-5 text-secondary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
          <div>
            <p className="text-sm font-medium text-foreground">
              {settings?.shipping?.title || 'Free shipping over £50'}
            </p>
            <p className="text-xs text-muted-foreground">
              {settings?.shipping?.description || 'Standard delivery 3-5 business days'}
            </p>
          </div>
        </div>

        {/* Returns highlight */}
        <div className="flex items-start gap-3">
          <svg className="size-5 text-secondary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
          <div>
            <p className="text-sm font-medium text-foreground">
              {settings?.returns?.title || 'Free 30-day returns'}
            </p>
            <p className="text-xs text-muted-foreground">
              {settings?.returns?.description || 'Hassle-free returns on all orders'}
            </p>
          </div>
        </div>

        {/* Secure payment - static, doesn't need to be configurable */}
        <div className="flex items-start gap-3">
          <svg className="size-5 text-secondary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-foreground">Secure checkout</p>
            <p className="text-xs text-muted-foreground">SSL encrypted payment</p>
          </div>
        </div>
      </div>
    </div>
  )
}
