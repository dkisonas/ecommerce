'use client'

// TailwindPlus Component: Ecommerce.Components.Product Quickviews.With color and size selector
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support (manually added)

import type { Product, Variant, VariantOption } from '@/payload-types'

import { createUrl } from '@/utilities/createUrl'
import clsx from 'clsx'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useMemo } from 'react'

export function VariantSelector({ product }: { product: Product }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const variants = product.variants?.docs
  const variantTypes = product.variantTypes
  const hasVariants = Boolean(product.enableVariants && variants?.length && variantTypes?.length)

  // Collect all option IDs that are actually used in this product's variants
  const usedOptionIds = useMemo(() => {
    if (!variants) return new Set<number>()

    const ids = new Set<number>()
    for (const variant of variants) {
      if (typeof variant !== 'object' || !variant.options) continue
      for (const opt of variant.options) {
        if (typeof opt === 'object' && opt?.id) {
          ids.add(opt.id)
        } else if (typeof opt === 'number') {
          ids.add(opt)
        }
      }
    }
    return ids
  }, [variants])

  if (!hasVariants) {
    return null
  }

  return (
    <div className="space-y-6">
      {variantTypes?.map((type) => {
        if (!type || typeof type !== 'object') {
          return null
        }

        const options = type.options?.docs

        if (!options || !Array.isArray(options) || !options.length) {
          return null
        }

        // Filter options to only show those used in product variants
        const availableOptions = options.filter((opt) => {
          if (!opt || typeof opt !== 'object') return false
          return usedOptionIds.has(opt.id)
        })

        if (availableOptions.length === 0) {
          return null
        }

        return (
          <fieldset key={type.id} aria-label={`Choose a ${type.label?.toLowerCase()}`}>
            <legend className="text-sm font-medium text-foreground">{type.label}</legend>

            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {availableOptions.map((option) => {
                if (!option || typeof option !== 'object') {
                  return null
                }

                const optionID = option.id
                const optionKeyLowerCase = type.name

                // Base option params on current params so we can preserve any other param state in the url.
                const optionSearchParams = new URLSearchParams(searchParams.toString())

                // Remove image and variant ID from this search params so we can loop over it safely.
                optionSearchParams.delete('variant')
                optionSearchParams.delete('image')

                // Update the option params using the current option to reflect how the url *would* change,
                // if the option was clicked.
                optionSearchParams.set(optionKeyLowerCase, String(optionID))

                const currentOptions = Array.from(optionSearchParams.values())

                let isAvailableForSale = true

                // Find a matching variant
                if (variants) {
                  const matchingVariant = variants
                    .filter((variant): variant is Variant => typeof variant === 'object')
                    .find((variant) => {
                      if (!variant.options || !Array.isArray(variant.options)) return false

                      // Check if all variant options match the current options in the URL
                      return variant.options.every((variantOption) => {
                        if (typeof variantOption !== 'object')
                          return currentOptions.includes(String(variantOption))

                        return currentOptions.includes(String(variantOption.id))
                      })
                    })

                  if (matchingVariant) {
                    // If we found a matching variant, set the variant ID in the search params.
                    optionSearchParams.set('variant', String(matchingVariant.id))

                    if (matchingVariant.inventory && matchingVariant.inventory > 0) {
                      isAvailableForSale = true
                    } else {
                      isAvailableForSale = false
                    }
                  }
                }

                const optionUrl = createUrl(pathname, optionSearchParams)

                // The option is active if it's in the url params.
                const isActive = searchParams.get(optionKeyLowerCase) === String(optionID)

                return (
                  <label
                    key={option.id}
                    aria-label={option.label}
                    title={`${option.label}${!isAvailableForSale ? ' (Out of Stock)' : ''}`}
                    className={clsx(
                      'group relative flex cursor-pointer items-center justify-center rounded-md border py-2 px-3 text-xs font-medium transition-colors',
                      {
                        // Active state - golden border (secondary is the gold color)
                        'border-secondary bg-secondary/10 text-foreground':
                          isActive && isAvailableForSale,
                        // Default state
                        'border-border bg-background text-foreground hover:bg-muted hover:border-muted-foreground':
                          !isActive && isAvailableForSale,
                        // Out of stock
                        'cursor-not-allowed border-border bg-muted/50 text-muted-foreground opacity-50':
                          !isAvailableForSale,
                      },
                    )}
                  >
                    <input
                      type="radio"
                      name={type.name}
                      value={optionID}
                      checked={isActive}
                      disabled={!isAvailableForSale}
                      onChange={() => {
                        router.replace(optionUrl, { scroll: false })
                      }}
                      className="sr-only"
                    />
                    <span>{option.label}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
