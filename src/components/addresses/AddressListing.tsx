'use client'

import React from 'react'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { AddressItem } from '@/components/addresses/AddressItem'
import { MapPinIcon } from '@heroicons/react/24/outline'

export const AddressListing: React.FC = () => {
  const { addresses } = useAddresses()

  // Show skeleton while loading (addresses is undefined until hydrated)
  if (addresses === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                <div className="h-3 w-40 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-8 w-12 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-4">
        <MapPinIcon className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">No addresses saved yet.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {addresses.map((address) => (
        <li key={address.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
          <AddressItem address={address} />
        </li>
      ))}
    </ul>
  )
}
