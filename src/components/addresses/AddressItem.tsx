'use client'

import React from 'react'
import type { Address } from '@/payload-types'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'

type Props = {
  address: Partial<Omit<Address, 'country'>> & { country?: string } // Allow address to be partial and entirely optional as this is entirely for display purposes
  /**
   * Completely override the default actions
   */
  actions?: React.ReactNode
  /**
   * Insert elements before the actions
   */
  beforeActions?: React.ReactNode
  /**
   * Insert elements after the actions
   */
  afterActions?: React.ReactNode
  /**
   * Hide all actions
   */
  hideActions?: boolean
}

export const AddressItem: React.FC<Props> = ({
  address,
  actions,
  hideActions = false,
  beforeActions,
  afterActions,
}) => {
  if (!address) {
    return null
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 text-sm">
        <p className="font-medium text-foreground">
          {address.title && <span>{address.title} </span>}
          {address.firstName} {address.lastName}
        </p>
        {address.company && (
          <p className="text-muted-foreground">{address.company}</p>
        )}
        <p className="text-muted-foreground">
          {address.addressLine1}
          {address.addressLine2 && `, ${address.addressLine2}`}
        </p>
        <p className="text-muted-foreground">
          {address.city}
          {address.state && `, ${address.state}`} {address.postalCode}
        </p>
        <p className="text-muted-foreground">{address.country}</p>
        {address.phone && (
          <p className="text-muted-foreground mt-1">{address.phone}</p>
        )}
      </div>

      {!hideActions && address.id && (
        <div className="shrink-0">
          {actions ? (
            actions
          ) : (
            <>
              {beforeActions}
              {address.id && (
                <CreateAddressModal
                  addressID={address.id}
                  initialData={address}
                  buttonText={'Edit'}
                  modalTitle={'Edit address'}
                />
              )}
              {afterActions}
            </>
          )}
        </div>
      )}
    </div>
  )
}
