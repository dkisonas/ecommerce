'use client'

// TailwindPlus styled checkout address selector
// Adapted for: React, Tailwind v4, dark mode support

import { AddressItem } from '@/components/addresses/AddressItem'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Address } from '@/payload-types'
import { useAddresses } from '@payloadcms/plugin-ecommerce/client/react'
import { useState } from 'react'

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
    <div className="space-y-4">
      {heading && (
        <div>
          <h3 className="text-base font-medium text-foreground">{heading}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <AddressesModal setAddress={setAddress} />
    </div>
  )
}

const AddressesModal: React.FC<Props> = ({ setAddress }) => {
  const [open, setOpen] = useState(false)
  const { addresses } = useAddresses()

  const closeModal = () => setOpen(false)

  if (!addresses || addresses.length === 0) {
    return <p className="text-sm text-muted-foreground">No addresses found. Please add an address.</p>
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background transition-colors"
      >
        Select an address
      </button>

      <Dialog open={open} onClose={closeModal} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/30 dark:bg-black/50 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-background dark:bg-card text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[enter]:ease-out data-[leave]:duration-200 data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="size-6" aria-hidden="true" />
                </button>
              </div>

              <div className="p-6">
                <DialogTitle as="h3" className="text-lg font-medium text-foreground">
                  Select an address
                </DialogTitle>

                <div className="mt-6 space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="rounded-lg border border-border p-4 hover:border-secondary/50 transition-colors"
                    >
                      <AddressItem
                        address={address}
                        beforeActions={
                          <button
                            type="button"
                            onClick={() => {
                              setAddress(address)
                              closeModal()
                            }}
                            className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background transition-colors"
                          >
                            Select
                          </button>
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <CreateAddressModal />
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}
