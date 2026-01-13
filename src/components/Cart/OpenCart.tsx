// TailwindPlus styled cart button
// Adapted for: React, Tailwind v4, dark mode support

import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import React from 'react'

export function OpenCartButton({
  className: _className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  return (
    <div
      className="relative flex items-center text-foreground hover:text-secondary transition-colors"
      {...rest}
    >
      <ShoppingBagIcon className="size-6" aria-hidden="true" />
      {quantity ? (
        <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
          {quantity}
        </span>
      ) : null}
      <span className="sr-only">Shopping cart{quantity ? ` (${quantity} items)` : ''}</span>
    </div>
  )
}
