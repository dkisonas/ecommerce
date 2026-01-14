'use client'


// TailwindPlus styled multi-step checkout
// Adapted for: React, Tailwind v4, dark mode support

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useTheme } from '@/providers/Theme'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useState } from 'react'

import { cssVariables } from '@/cssVariables'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Address, ShippingMethod } from '@/payload-types'
import { AddressItem } from '@/components/addresses/AddressItem'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { ShippingMethodSelector } from '@/components/checkout/ShippingMethodSelector'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)

export const CheckoutPage: React.FC = (): React.ReactElement | null => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const { theme } = useTheme()
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentData, setPaymentData] = useState<null | Record<string, unknown>>(null)
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [useDifferentBillingAddress, setUseDifferentBillingAddress] = useState(false)
  const [isProcessingPayment, setProcessingPayment] = useState(false)
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null)
  const [shippingCost, setShippingCost] = useState<number>(0)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length
  const cartSubtotal = cart?.subtotal || 0
  const orderTotal = cartSubtotal + shippingCost

  // For logged-in users, use their stored info; for guests, use form fields
  const hasContactInfo = user
    ? Boolean(user.email && user.firstName && user.lastName)
    : Boolean(email && firstName && lastName)

  const canGoToPayment = Boolean(
    hasContactInfo &&
      shippingAddress &&
      (!useDifferentBillingAddress || billingAddress) &&
      selectedShippingMethod,
  )

  const handleShippingSelect = useCallback(
    (method: ShippingMethod, effectiveCost: number) => {
      setSelectedShippingMethod(method)
      setShippingCost(effectiveCost)
    },
    [],
  )

  // On initial load wait for addresses to be loaded and check to see if we can prefill a default one
  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setShippingAddress(defaultAddress)
        }
      }
    }
  }, [addresses])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setUseDifferentBillingAddress(false)
      setEmail('')
      setFirstName('')
      setLastName('')
      setPhone('')
    }
  }, [])

  const initiatePaymentIntent = useCallback(
    async (paymentID: string): Promise<void> => {
      try {
        const customerEmail = email || user?.email
        const customerFirstName = firstName || user?.firstName || ''
        const customerLastName = lastName || user?.lastName || ''
        const customerPhone = phone || user?.phone || ''

        const paymentData = (await initiatePayment(paymentID, {
          additionalData: {
            ...(customerEmail ? { customerEmail } : {}),
            customerFirstName,
            customerLastName,
            customerPhone,
            shippingAddress,
            billingAddress: useDifferentBillingAddress ? billingAddress : shippingAddress,
            // Shipping info
            shippingMethodId: selectedShippingMethod?.id,
            shippingCost,
            subtotal: cartSubtotal,
          },
        })) as Record<string, unknown>

        if (paymentData) {
          setPaymentData(paymentData)
          setCurrentStep(1) // Move to payment step
        }
      } catch (error) {
        const errorData = error instanceof Error ? JSON.parse(error.message) : {}
        let errorMessage = 'An error occurred while initiating payment.'

        if (errorData?.cause?.code === 'OutOfStock') {
          errorMessage = 'One or more items in your cart are out of stock.'
        }

        setError(errorMessage)
        toast.error(errorMessage)
      }
    },
    [
      shippingAddress,
      useDifferentBillingAddress,
      billingAddress,
      email,
      firstName,
      lastName,
      phone,
      user,
      initiatePayment,
      selectedShippingMethod,
      shippingCost,
      cartSubtotal,
    ],
  )

  const handleStepClick = (step: number) => {
    // Only allow going back to completed steps
    if (step < currentStep) {
      if (step === 0) {
        // Going back to contact/address step
        setPaymentData(null)
      }
      setCurrentStep(step)
    }
  }

  if (!stripe) return null

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-12 w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center mb-8">
          <p className="text-lg text-foreground">Processing your payment...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="py-16 w-full flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-lg text-muted-foreground mb-4">Your cart is empty.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 font-medium"
        >
          <ArrowLeftIcon className="size-4" />
          Continue shopping
        </Link>
      </div>
    )
  }

  const isStep0: boolean = currentStep === 0
  const isStep1: boolean = currentStep === 1

  return (
    <div className="bg-background dark:bg-background">
      {/* Progress Steps */}
      <CheckoutSteps currentStep={currentStep} onStepClick={handleStepClick} />

      <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-lg">
            {/* Step 0: Contact & Address */}
            {isStep0 ? (
              <div className="space-y-6 lg:space-y-8">
                {/* Contact Section */}
                <section className="rounded-xl border border-border bg-card p-4 lg:border-0 lg:bg-transparent lg:p-0">
                  <h2 className="text-lg font-medium text-foreground">Contact information</h2>

                  {user ? (
                    <div className="mt-4 space-y-1">
                      <p className="text-sm text-foreground">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 rounded-lg border border-border bg-muted/30 dark:bg-muted/10 p-3">
                        <p className="text-sm text-muted-foreground">
                          Have an account?{' '}
                          <Link href="/login" className="text-secondary hover:text-secondary/80 font-medium">
                            Log in
                          </Link>{' '}
                          for a faster checkout.
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First name</Label>
                          <Input
                            id="first-name"
                            name="first-name"
                            type="text"
                            autoComplete="given-name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last name</Label>
                          <Input
                            id="last-name"
                            name="last-name"
                            type="text"
                            autoComplete="family-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label htmlFor="email-address">Email</Label>
                        <Input
                          id="email-address"
                          name="email-address"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label htmlFor="phone">
                          Phone <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+370 600 00000"
                        />
                      </div>
                    </>
                  )}
                </section>

                {/* Shipping Address Section (Primary) */}
                <section className="rounded-xl border border-border bg-card p-4 lg:border-0 lg:bg-transparent lg:p-0">
                  <h2 className="text-lg font-medium text-foreground">Shipping address</h2>

                  {shippingAddress ? (
                    <div className="mt-4 rounded-lg border border-border bg-muted/30 dark:bg-muted/10 p-4">
                      <AddressItem
                        address={shippingAddress}
                        actions={
                          <button
                            type="button"
                            onClick={() => setShippingAddress(undefined)}
                            className="text-sm font-medium text-secondary hover:text-secondary/80"
                          >
                            Change
                          </button>
                        }
                      />
                    </div>
                  ) : user ? (
                    <div className="mt-4">
                      <CheckoutAddresses heading="" setAddress={setShippingAddress} />
                    </div>
                  ) : (
                    <div className="mt-4">
                      <CreateAddressModal
                        disabled={!email}
                        callback={(address) => {
                          setShippingAddress(address)
                        }}
                        skipSubmission={true}
                      />
                    </div>
                  )}

                  {/* Optional different billing address */}
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      id="different-billing"
                      type="checkbox"
                      checked={useDifferentBillingAddress}
                      onChange={(e) => setUseDifferentBillingAddress(e.target.checked)}
                      className="size-4 rounded border-border text-secondary focus:ring-secondary"
                    />
                    <label htmlFor="different-billing" className="text-sm text-foreground">
                      Use different billing address
                    </label>
                  </div>

                  {useDifferentBillingAddress && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h3 className="text-base font-medium text-foreground">Billing address</h3>
                      {billingAddress ? (
                        <div className="mt-3 rounded-lg border border-border bg-muted/30 dark:bg-muted/10 p-4">
                          <AddressItem
                            address={billingAddress}
                            actions={
                              <button
                                type="button"
                                onClick={() => setBillingAddress(undefined)}
                                className="text-sm font-medium text-secondary hover:text-secondary/80"
                              >
                                Change
                              </button>
                            }
                          />
                        </div>
                      ) : user ? (
                        <div className="mt-3">
                          <CheckoutAddresses heading="" setAddress={setBillingAddress} />
                        </div>
                      ) : (
                        <div className="mt-3">
                          <CreateAddressModal
                            callback={(address) => {
                              setBillingAddress(address)
                            }}
                            disabled={!email}
                            skipSubmission={true}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Shipping Method Section */}
                <section className="rounded-xl border border-border bg-card p-4 lg:border-0 lg:bg-transparent lg:p-0">
                  <h2 className="text-lg font-medium text-foreground">Shipping method</h2>
                  <ShippingMethodSelector
                    subtotal={cartSubtotal}
                    selectedMethod={selectedShippingMethod}
                    onSelect={handleShippingSelect}
                  />
                </section>

                {/* Continue Button */}
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  disabled={!canGoToPayment}
                  onClick={() => void initiatePaymentIntent('stripe')}
                  className="w-full"
                >
                  Continue to payment
                </Button>

                {error && !paymentData && (
                  <div className="mt-4">
                    <Message error={error} />
                    <button
                      type="button"
                      onClick={() => {
                        setError(null)
                        router.refresh()
                      }}
                      className="mt-2 text-sm font-medium text-secondary hover:text-secondary/80"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Step 1: Payment - Order Summary + Payment Form */}
            {isStep1 && paymentData?.['clientSecret'] ? (
              <div className="space-y-6">
                {/* Order Summary */}
                <section className="rounded-xl border border-border bg-card p-4">
                  <h2 className="text-lg font-medium text-foreground mb-4">Order summary</h2>
                  <ul role="list" className="divide-y divide-border">
                    {cart?.items?.map((item, index) => {
                      if (typeof item.product === 'object' && item.product) {
                        const {
                          product,
                          product: { title, gallery },
                          quantity,
                          variant,
                        } = item

                        if (!quantity) return null

                        let image = gallery?.[0]?.image || product?.meta?.image
                        let price = product?.priceInGBP

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
                          if (imageVariant && typeof imageVariant.image !== 'string') {
                            image = imageVariant.image
                          }
                        }

                        return (
                          <li key={index} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                            <div className="size-14 flex-none rounded-md bg-muted dark:bg-muted/30 overflow-hidden relative">
                              {image && typeof image !== 'string' && (
                                <Media fill imgClassName="size-full object-cover" resource={image} />
                              )}
                            </div>
                            <div className="flex-auto min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{title}</p>
                              {variant && typeof variant === 'object' && (
                                <p className="text-xs text-muted-foreground">
                                  {variant.options?.map((option) => typeof option === 'object' ? option.label : null).filter(Boolean).join(', ')}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                            </div>
                            <div className="text-sm font-medium text-foreground">
                              {typeof price === 'number' && <Price amount={price * quantity} />}
                            </div>
                          </li>
                        )
                      }
                      return null
                    })}
                  </ul>
                  <dl className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd className="text-foreground"><Price amount={cartSubtotal} /></dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Shipping</dt>
                      <dd className="text-foreground">
                        {shippingCost === 0 ? (
                          <span className="text-green-600 dark:text-green-500">Free</span>
                        ) : (
                          <Price amount={shippingCost} />
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border font-medium">
                      <dt className="text-foreground">Total</dt>
                      <dd className="text-foreground"><Price amount={orderTotal} /></dd>
                    </div>
                  </dl>
                </section>

                {/* Payment Form */}
                <section className="rounded-xl border border-border bg-card p-4">
                  <h2 className="text-lg font-medium text-foreground">Payment</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your card information to complete your purchase.
                  </p>

                  {error && (
                    <div className="mt-4">
                      <Message error={error} />
                    </div>
                  )}

                  <Suspense fallback={<React.Fragment />}>
                    <div className="mt-4">
                      <Elements
                        options={{
                          appearance: {
                            theme: 'stripe',
                            variables: {
                              borderRadius: '6px',
                              colorPrimary: '#858585',
                              gridColumnSpacing: '20px',
                              gridRowSpacing: '20px',
                              colorBackground:
                                theme === 'dark' ? '#0a0a0a' : cssVariables.colors.base0,
                              colorDanger: cssVariables.colors.error500,
                              colorDangerText: cssVariables.colors.error500,
                              colorIcon:
                                theme === 'dark'
                                  ? cssVariables.colors.base0
                                  : cssVariables.colors.base1000,
                              colorText:
                                theme === 'dark' ? '#858585' : cssVariables.colors.base1000,
                              colorTextPlaceholder: '#858585',
                              fontFamily: 'Geist, sans-serif',
                              fontSizeBase: '16px',
                              fontWeightBold: '600',
                              fontWeightNormal: '500',
                              spacingUnit: '4px',
                            },
                          },
                          clientSecret: paymentData['clientSecret'] as string,
                        }}
                        stripe={stripe}
                      >
                        <CheckoutForm
                          customerEmail={email}
                          billingAddress={useDifferentBillingAddress ? billingAddress : shippingAddress}
                          setProcessingPayment={setProcessingPayment}
                        />
                      </Elements>
                    </div>
                  </Suspense>
                </section>

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentData(null)
                    setCurrentStep(0)
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeftIcon className="size-4" />
                  Back to shipping
                </button>
              </div>
            ) : null}
        </div>
      </div>
    </div>
  )
}
