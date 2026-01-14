'use client'

// TailwindPlus: Application UI.Overlays.Modals.Simple with gray footer
// Adapted for: React, Tailwind v4, dark mode support

import { Fragment, useState, useCallback } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'

type FormData = {
  email: string
  orderID: string
}

type TrackOrderModalProps = {
  trigger?: React.ReactNode
  initialEmail?: string
}

export function TrackOrderModal({ trigger, initialEmail }: TrackOrderModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      email: initialEmail || '',
    },
  })

  const openModal = () => setIsOpen(true)
  const closeModal = () => {
    setIsOpen(false)
    reset()
  }

  const onSubmit = useCallback(
    async (data: FormData) => {
      router.push(`/orders/${data.orderID}?email=${data.email}`)
      setIsOpen(false)
      reset()
    },
    [router, reset],
  )

  return (
    <>
      {/* Trigger */}
      {trigger ? (
        <div onClick={openModal}>{trigger}</div>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-secondary transition-colors"
        >
          <MagnifyingGlassIcon className="size-4" />
          Track Order
        </button>
      )}

      {/* Modal */}
      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          {/* Backdrop */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70" />
          </TransitionChild>

          {/* Modal container */}
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-xl bg-background dark:bg-card text-left align-middle shadow-xl transition-all">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <DialogTitle
                      as="h3"
                      className="text-lg font-semibold text-foreground"
                    >
                      Track Your Order
                    </DialogTitle>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="size-5" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Content */}
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="px-6 py-5 space-y-5">
                      <p className="text-sm text-muted-foreground">
                        Enter your email address and order ID to view your order status.
                      </p>

                      <FormItem>
                        <Label htmlFor="modal-email">Email address</Label>
                        <Input
                          id="modal-email"
                          {...register('email', { required: 'Email is required.' })}
                          type="email"
                          placeholder="you@example.com"
                          className="mt-1.5"
                        />
                        {errors.email && <FormError message={errors.email.message} />}
                      </FormItem>

                      <FormItem>
                        <Label htmlFor="modal-orderID">Order ID</Label>
                        <Input
                          id="modal-orderID"
                          {...register('orderID', {
                            required: 'Order ID is required. You can find this in your confirmation email.',
                          })}
                          type="text"
                          placeholder="Enter your order ID"
                          className="mt-1.5"
                        />
                        {errors.orderID && <FormError message={errors.orderID.message} />}
                      </FormItem>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 dark:bg-muted/10 px-6 py-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeModal}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="secondary">
                        Find Order
                      </Button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
