'use client'

// TailwindPlus styled quantity button
// Adapted for: React, Tailwind v4, dark mode support

import { CartItem } from '@/components/Cart'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import React, { useMemo } from 'react'

export function EditItemQuantityButton({ type, item }: { item: CartItem; type: 'minus' | 'plus' }) {
  const { decrementItem, incrementItem } = useCart()

  const disabled = useMemo(() => {
    if (!item.id) return true

    const target =
      item.variant && typeof item.variant === 'object'
        ? item.variant
        : item.product && typeof item.product === 'object'
          ? item.product
          : null

    if (
      target &&
      typeof target === 'object' &&
      target.inventory !== undefined &&
      target.inventory !== null
    ) {
      if (type === 'plus' && item.quantity !== undefined && item.quantity !== null) {
        return item.quantity >= target.inventory
      }
    }

    return false
  }, [item, type])

  return (
    <button
      type="button"
      aria-disabled={disabled}
      disabled={disabled}
      aria-label={type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'}
      className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => {
        if (item.id) {
          if (type === 'plus') {
            incrementItem(item.id as unknown as number)
          } else {
            decrementItem(item.id as unknown as number)
          }
        }
      }}
    >
      {type === 'plus' ? (
        <PlusIcon className="size-4" aria-hidden="true" />
      ) : (
        <MinusIcon className="size-4" aria-hidden="true" />
      )}
    </button>
  )
}
