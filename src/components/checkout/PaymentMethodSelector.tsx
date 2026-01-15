'use client'

// TailwindPlus styled payment method selector
// __name__: Application UI.Lists.Radio Groups.Simple table
// __version__: Adapted for payment methods
// Adapted for: React, Tailwind v4, dark mode support

import React from 'react'
import { PaymentProviderName } from '@/lib/payments'
import {
  CreditCardIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'

export interface PaymentMethod {
  id: PaymentProviderName
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  flowType: 'embedded' | 'redirect'
}

const PAYMENT_METHODS: Record<PaymentProviderName, PaymentMethod> = {
  stripe: {
    id: 'stripe',
    name: 'Card Payment',
    description: 'Pay securely with your credit or debit card',
    icon: CreditCardIcon,
    flowType: 'embedded',
  },
  paysera: {
    id: 'paysera',
    name: 'Bank Transfer (Paysera)',
    description: 'Pay via your bank using Paysera',
    icon: BuildingLibraryIcon,
    flowType: 'redirect',
  },
  neopay: {
    id: 'neopay',
    name: 'Bank Payment (Neopay)',
    description: 'Pay directly from your bank account',
    icon: BanknotesIcon,
    flowType: 'redirect',
  },
}

interface Props {
  availableMethods: PaymentProviderName[]
  selectedMethod: PaymentProviderName | null
  onSelect: (method: PaymentProviderName) => void
  disabled?: boolean
}

export const PaymentMethodSelector: React.FC<Props> = ({
  availableMethods,
  selectedMethod,
  onSelect,
  disabled = false,
}) => {
  // Don't render if only one method is available
  if (availableMethods.length <= 1) {
    return null
  }

  const methods = availableMethods
    .map((id) => PAYMENT_METHODS[id])
    .filter(Boolean)

  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">Select a payment method</legend>
      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = selectedMethod === method.id
          const Icon = method.icon

          return (
            <label
              key={method.id}
              className={`
                relative flex cursor-pointer rounded-lg border p-4 transition-colors
                ${
                  isSelected
                    ? 'border-secondary bg-secondary/5 dark:bg-secondary/10'
                    : 'border-border bg-card hover:border-muted-foreground/50'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={isSelected}
                onChange={() => onSelect(method.id)}
                className="sr-only"
                disabled={disabled}
              />
              <div className="flex flex-1 items-center gap-4">
                <div
                  className={`
                    flex size-10 items-center justify-center rounded-full
                    ${isSelected ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}
                  `}
                >
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {method.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {method.description}
                  </span>
                </div>
                <div
                  className={`
                    flex size-5 items-center justify-center rounded-full border-2
                    ${isSelected ? 'border-secondary' : 'border-border'}
                  `}
                >
                  {isSelected && (
                    <div className="size-2.5 rounded-full bg-secondary" />
                  )}
                </div>
              </div>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/**
 * Get available payment methods based on environment configuration
 */
export function getAvailablePaymentMethods(): PaymentProviderName[] {
  const methods: PaymentProviderName[] = []

  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    methods.push('stripe')
  }

  if (process.env.NEXT_PUBLIC_PAYSERA_ENABLED === 'true') {
    methods.push('paysera')
  }

  if (process.env.NEXT_PUBLIC_NEOPAY_ENABLED === 'true') {
    methods.push('neopay')
  }

  return methods
}

/**
 * Get the flow type for a payment method
 */
export function getPaymentFlowType(
  method: PaymentProviderName,
): 'embedded' | 'redirect' {
  return PAYMENT_METHODS[method]?.flowType ?? 'embedded'
}
