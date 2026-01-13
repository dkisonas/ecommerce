'use client'

// TailwindPlus Component: Ecommerce.Components.Shopping Carts.Drawer
// Version: 2026-01-12-184920
// Adapted for: React, Tailwind v4, dark mode support (manually added)

import { useContext, useEffect, useMemo, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { Price } from '@/components/Price'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { DeleteItemButton } from './DeleteItemButton'
import { EditItemQuantityButton } from './EditItemQuantityButton'
import { OpenCartButton } from './OpenCart'
import { Product } from '@/payload-types'
import { HeaderContext } from '@/components/Header/HeaderContext'

type CartModalProps = {
  /** External loading state - when provided, overrides internal loading logic */
  externalLoading?: boolean
}

export function CartModal({ externalLoading }: CartModalProps = {}) {
  const { cart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Try to get loading state from HeaderContext if available (when inside HeaderProvider)
  // Returns null if used outside HeaderProvider, which is fine - we'll fall back to internal loading
  const headerContext = useContext(HeaderContext)

  useEffect(() => {
    // Close the cart modal when the pathname changes
    setIsOpen(false)
  }, [pathname])

  // Priority: externalLoading prop > HeaderContext > false (no internal loading)
  // The cart hook doesn't provide a loading state, so we rely on context or prop
  const contextLoading = headerContext?.isLoading
  const isLoading =
    externalLoading !== undefined
      ? externalLoading
      : contextLoading !== undefined
        ? contextLoading
        : false

  const totalQuantity = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return undefined
    return cart.items.reduce((quantity, item) => (item.quantity || 0) + quantity, 0)
  }, [cart])

  return (
    <>
      <button
        onClick={() => !isLoading && setIsOpen(true)}
        disabled={isLoading}
        className="relative disabled:cursor-default"
      >
        <OpenCartButton quantity={totalQuantity} isLoading={isLoading} />
      </button>

      <Dialog open={isOpen} onClose={setIsOpen} className="relative z-50">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/30 dark:bg-black/50 transition-opacity duration-300 ease-in-out data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-300 ease-in-out data-[closed]:translate-x-full"
              >
                <div className="flex h-full flex-col overflow-y-auto bg-background dark:bg-background shadow-xl">
                  {/* Header */}
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-lg font-medium text-foreground">
                        Shopping cart
                      </DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="relative -m-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </div>

                    {/* Cart items */}
                    <div className="mt-8">
                      {!cart || cart?.items?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <ShoppingBagIcon className="size-16 text-muted-foreground mb-4" />
                          <p className="text-xl font-medium text-foreground">Your cart is empty</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Start shopping to add items to your cart.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="mt-6 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
                          >
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flow-root">
                          <ul role="list" className="-my-6 divide-y divide-border">
                            {cart?.items?.map((item, i) => {
                              const product = item.product
                              const variant = item.variant

                              if (typeof product !== 'object' || !item || !product || !product.slug)
                                return null

                              const metaImage =
                                product.meta?.image && typeof product.meta?.image === 'object'
                                  ? product.meta.image
                                  : undefined

                              const firstGalleryImage =
                                typeof product.gallery?.[0]?.image === 'object'
                                  ? product.gallery?.[0]?.image
                                  : undefined

                              let image = firstGalleryImage || metaImage
                              let price = product.priceInGBP

                              const isVariant = Boolean(variant) && typeof variant === 'object'

                              if (isVariant) {
                                price = variant?.priceInGBP

                                const imageVariant = product.gallery?.find((galleryItem) => {
                                  if (!galleryItem.variantOption) return false
                                  const variantOptionID =
                                    typeof galleryItem.variantOption === 'object'
                                      ? galleryItem.variantOption.id
                                      : galleryItem.variantOption

                                  const hasMatch = variant?.options?.some((option) => {
                                    if (typeof option === 'object') return option.id === variantOptionID
                                    else return option === variantOptionID
                                  })

                                  return hasMatch
                                })

                                if (imageVariant && typeof imageVariant.image === 'object') {
                                  image = imageVariant.image
                                }
                              }

                              return (
                                <li key={i} className="flex py-6">
                                  <div className="size-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                                    {image?.url && (
                                      <Image
                                        alt={image?.alt || product?.title || ''}
                                        src={image.url}
                                        width={96}
                                        height={96}
                                        className="size-full object-cover"
                                      />
                                    )}
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-foreground">
                                        <h3>
                                          <Link
                                            href={`/products/${(item.product as Product)?.slug}`}
                                            onClick={() => setIsOpen(false)}
                                            className="hover:text-secondary transition-colors"
                                          >
                                            {product?.title}
                                          </Link>
                                        </h3>
                                        {typeof price === 'number' && (
                                          <Price amount={price} className="ml-4" />
                                        )}
                                      </div>
                                      {isVariant && variant ? (
                                        <p className="mt-1 text-sm text-muted-foreground capitalize">
                                          {variant.options
                                            ?.map((option) => {
                                              if (typeof option === 'object') return option.label
                                              return null
                                            })
                                            .join(', ')}
                                        </p>
                                      ) : null}
                                    </div>

                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      {/* Quantity controls */}
                                      <div className="flex items-center gap-2 rounded-md border border-border">
                                        <EditItemQuantityButton item={item} type="minus" />
                                        <span className="w-8 text-center text-foreground">
                                          {item.quantity}
                                        </span>
                                        <EditItemQuantityButton item={item} type="plus" />
                                      </div>

                                      {/* Remove button */}
                                      <DeleteItemButton item={item} />
                                    </div>
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer with totals and checkout */}
                  {cart && cart?.items && cart.items.length > 0 && (
                    <div className="border-t border-border px-4 py-6 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-foreground">
                        <p>Subtotal</p>
                        {typeof cart?.subtotal === 'number' && <Price amount={cart.subtotal} />}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Shipping and taxes calculated at checkout.
                      </p>
                      <div className="mt-6">
                        <Link
                          href="/checkout"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center justify-center rounded-md bg-secondary px-6 py-3 text-base font-medium text-secondary-foreground shadow-sm hover:bg-secondary/90 transition-colors"
                        >
                          Checkout
                        </Link>
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-muted-foreground">
                        <p>
                          or{' '}
                          <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="font-medium text-secondary hover:text-secondary/80 transition-colors"
                          >
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}
