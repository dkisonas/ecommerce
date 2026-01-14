'use client'

import { ShippingMethod } from '@/payload-types'
import { Price } from '@/components/Price'
import { cn } from '@/utilities/cn'
import { useEffect, useState } from 'react'
import { CheckIcon, TruckIcon } from '@heroicons/react/24/outline'

type ShippingMethodSelectorProps = {
  subtotal: number
  selectedMethod: ShippingMethod | null
  onSelect: (method: ShippingMethod, effectiveCost: number) => void
}

export function ShippingMethodSelector({
  subtotal,
  selectedMethod,
  onSelect,
}: ShippingMethodSelectorProps) {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMethods() {
      try {
        const response = await fetch('/api/shipping-methods?where[enabled][equals]=true&sort=sortOrder')
        if (response.ok) {
          const data = await response.json()
          setMethods(data.docs || [])
        }
      } catch (error) {
        console.error('Failed to fetch shipping methods:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMethods()
  }, [])

  // Auto-select first method if none selected
  useEffect(() => {
    if (!selectedMethod && methods.length > 0) {
      const firstMethod = methods[0]
      const effectiveCost = getEffectiveCost(firstMethod)
      onSelect(firstMethod, effectiveCost)
    }
  }, [methods, selectedMethod, onSelect])

  function getEffectiveCost(method: ShippingMethod): number {
    // Check if free shipping applies
    if (method.freeAbove && subtotal >= method.freeAbove) {
      return 0
    }
    return method.price || 0
  }

  if (loading) {
    return (
      <div className="mt-4 space-y-3 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-muted/30 dark:bg-muted/10" />
        ))}
      </div>
    )
  }

  if (methods.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-border bg-muted/30 dark:bg-muted/10 p-4">
        <p className="text-sm text-muted-foreground">No shipping methods available.</p>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      {methods.map((method) => {
        const effectiveCost = getEffectiveCost(method)
        const isFree = effectiveCost === 0 && method.price > 0
        const isSelected = selectedMethod?.id === method.id

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method, effectiveCost)}
            className={cn(
              'w-full rounded-lg border p-4 text-left transition-all duration-150 cursor-pointer',
              isSelected
                ? 'border-secondary bg-secondary/5 dark:bg-secondary/10 ring-1 ring-secondary'
                : 'border-border bg-muted/30 dark:bg-muted/10 hover:border-secondary hover:bg-secondary/5 dark:hover:bg-secondary/10 hover:shadow-sm',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <TruckIcon
                  className={cn(
                    'size-5 mt-0.5 shrink-0',
                    isSelected ? 'text-secondary' : 'text-muted-foreground',
                  )}
                />
                <div>
                  <p className="font-medium text-foreground">{method.title}</p>
                  {method.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{method.description}</p>
                  )}
                  {method.estimatedDays && (
                    <p className="text-sm text-muted-foreground mt-1">{method.estimatedDays}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  {isFree ? (
                    <div>
                      <span className="text-sm line-through text-muted-foreground">
                        <Price amount={method.price} />
                      </span>
                      <span className="ml-2 font-medium text-green-600 dark:text-green-500">
                        Free
                      </span>
                    </div>
                  ) : effectiveCost === 0 ? (
                    <span className="font-medium text-green-600 dark:text-green-500">Free</span>
                  ) : (
                    <span className="font-medium text-foreground">
                      <Price amount={effectiveCost} />
                    </span>
                  )}
                </div>
                {isSelected && (
                  <div className="flex size-5 items-center justify-center rounded-full bg-secondary">
                    <CheckIcon className="size-3 text-secondary-foreground" strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>
            {method.freeAbove && !isFree && (
              <p className="mt-2 text-xs text-muted-foreground ml-8">
                Free on orders over <Price amount={method.freeAbove} />
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}
