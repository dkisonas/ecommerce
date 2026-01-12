'use client'

// TailwindPlus Component: Ecommerce.Components.Product Overviews.With image gallery and expandable details
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support (manually added)

import type { Product, Variant } from '@/payload-types'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { RichText } from '@/components/RichText'
import { AddToCart } from '@/components/Cart/AddToCart'
import { Price } from '@/components/Price'
import React, { Suspense } from 'react'

import { VariantSelector } from './VariantSelector'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { StockIndicator } from '@/components/product/StockIndicator'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  let amount = 0,
    lowestAmount = 0,
    highestAmount = 0
  const priceField = `priceIn${currency.code}` as keyof Product
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const priceField = `priceIn${currency.code}` as keyof Variant
    const variantsOrderedByPrice = product.variants?.docs
      ?.filter((variant) => variant && typeof variant === 'object')
      .sort((a, b) => {
        if (
          typeof a === 'object' &&
          typeof b === 'object' &&
          priceField in a &&
          priceField in b &&
          typeof a[priceField] === 'number' &&
          typeof b[priceField] === 'number'
        ) {
          return a[priceField] - b[priceField]
        }

        return 0
      }) as Variant[]

    const lowestVariant = variantsOrderedByPrice[0][priceField]
    const highestVariant = variantsOrderedByPrice[variantsOrderedByPrice.length - 1][priceField]
    if (
      variantsOrderedByPrice &&
      typeof lowestVariant === 'number' &&
      typeof highestVariant === 'number'
    ) {
      lowestAmount = lowestVariant
      highestAmount = highestVariant
    }
  } else if (product[priceField] && typeof product[priceField] === 'number') {
    amount = product[priceField]
  }

  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.title}</h1>

      {/* Price */}
      <div className="mt-3">
        <h2 className="sr-only">Product information</h2>
        <p className="text-3xl tracking-tight text-foreground">
          {hasVariants ? (
            <Price highestAmount={highestAmount} lowestAmount={lowestAmount} />
          ) : (
            <Price amount={amount} />
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

      {/* Expandable details section */}
      <section aria-labelledby="details-heading" className="mt-12">
        <h2 id="details-heading" className="sr-only">
          Additional details
        </h2>

        <div className="divide-y divide-border border-t border-border">
          {/* Shipping info */}
          <Disclosure as="div">
            <h3>
              <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                <span className="text-sm font-medium text-foreground group-data-[open]:text-secondary">
                  Shipping
                </span>
                <span className="ml-6 flex items-center">
                  <PlusIcon
                    aria-hidden="true"
                    className="block size-6 text-muted-foreground group-hover:text-foreground group-data-[open]:hidden"
                  />
                  <MinusIcon
                    aria-hidden="true"
                    className="hidden size-6 text-secondary group-hover:text-secondary/80 group-data-[open]:block"
                  />
                </span>
              </DisclosureButton>
            </h3>
            <DisclosurePanel className="pb-6">
              <ul
                role="list"
                className="list-disc space-y-1 pl-5 text-sm text-muted-foreground marker:text-muted-foreground/50"
              >
                <li className="pl-2">Free shipping on orders over £50</li>
                <li className="pl-2">UK delivery: 3-5 business days</li>
                <li className="pl-2">International shipping available</li>
                <li className="pl-2">Express delivery options at checkout</li>
              </ul>
            </DisclosurePanel>
          </Disclosure>

          {/* Returns info */}
          <Disclosure as="div">
            <h3>
              <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                <span className="text-sm font-medium text-foreground group-data-[open]:text-secondary">
                  Returns
                </span>
                <span className="ml-6 flex items-center">
                  <PlusIcon
                    aria-hidden="true"
                    className="block size-6 text-muted-foreground group-hover:text-foreground group-data-[open]:hidden"
                  />
                  <MinusIcon
                    aria-hidden="true"
                    className="hidden size-6 text-secondary group-hover:text-secondary/80 group-data-[open]:block"
                  />
                </span>
              </DisclosureButton>
            </h3>
            <DisclosurePanel className="pb-6">
              <ul
                role="list"
                className="list-disc space-y-1 pl-5 text-sm text-muted-foreground marker:text-muted-foreground/50"
              >
                <li className="pl-2">30-day return policy</li>
                <li className="pl-2">Free returns on all orders</li>
                <li className="pl-2">Items must be unused and in original packaging</li>
                <li className="pl-2">Refund processed within 5-7 business days</li>
              </ul>
            </DisclosurePanel>
          </Disclosure>
        </div>
      </section>
    </div>
  )
}
