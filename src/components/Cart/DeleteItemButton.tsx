'use client'

// TailwindPlus styled delete button
// Adapted for: React, Tailwind v4, dark mode support

import type { CartItem } from '@/components/Cart'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import React from 'react'

export function DeleteItemButton({ item }: { item: CartItem }) {
  const { removeItem } = useCart()
  const itemId = item.id

  return (
    <button
      type="button"
      aria-disabled={!itemId}
      disabled={!itemId}
      aria-label="Remove cart item"
      className="font-medium text-secondary hover:text-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => {
        if (itemId) removeItem(itemId as unknown as number)
      }}
    >
      Remove
    </button>
  )
}
