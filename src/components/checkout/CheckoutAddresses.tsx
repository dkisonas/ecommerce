'use client'

// TailwindPlus styled checkout address selector
// Adapted for: React, Tailwind v4, dark mode support
// Shows address list directly as selectable cards (no modal)

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Address } from '@/payload-types'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'

type Props = {
  selectedAddress?: Address
  setAddress: React.Dispatch<React.SetStateAction<Partial<Address> | undefined>>
  heading?: string
  description?: string
  setSubmit?: React.Dispatch<React.SetStateAction<() => void | Promise<void>>>
}

export const CheckoutAddresses: React.FC<Props> = ({
  setAddress,
  heading = 'Addresses',
  description = 'Please select or add your shipping and billing addresses.',
}) => {
  const { addresses } = useAddresses()

  if (!addresses || addresses.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">No addresses found. Please add an address.</p>
        <CreateAddressModal />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {heading && (
        <div>
          <h3 className="text-base font-medium text-foreground">{heading}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      {/* Address list - directly selectable cards */}
      <div className="space-y-2">
        {addresses.map((address) => (
          <button
            key={address.id}
            type="button"
            onClick={() => setAddress(address)}
            className="w-full text-left rounded-lg border border-border p-3 hover:border-secondary hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background"
          >
            <AddressItem address={address} compact />
          </button>
        ))}
      </div>

      {/* Add new address option */}
      <div className="pt-2">
        <CreateAddressModal />
      </div>
    </div>
  )
}
