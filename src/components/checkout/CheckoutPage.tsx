'use client'


// TailwindPlus styled multi-step checkout
// Adapted for: React, Tailwind v4, dark mode support

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
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
import { Address } from '@/payload-types'
import { AddressItem } from '@/components/addresses/AddressItem'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

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
  const [emailEditable, setEmailEditable] = useState(true)
  const [paymentData, setPaymentData] = useState<null | Record<string, unknown>>(null)
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length

  const canGoToPayment = Boolean(
    (email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress),
  )

  // On initial load wait for addresses to be loaded and check to see if we can prefill a default one
  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const initiatePaymentIntent = useCallback(
    async (paymentID: string): Promise<void> => {
      try {
        const paymentData = (await initiatePayment(paymentID, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            billingAddress,
            shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
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
    [billingAddress, billingAddressSameAsShipping, shippingAddress, email, initiatePayment],
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

      <div className="mx-auto max-w-7xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-lg grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
          {/* Left Column - Form */}
          <div className="mx-auto w-full max-w-lg">
            {/* Step 0: Contact & Address */}
            {isStep0 ? (
              <div className="space-y-8">
                {/* Contact Section */}
                <section>
                  <h2 className="text-lg font-medium text-foreground">Contact information</h2>

                  {!user && (
                    <div className="mt-4 rounded-lg border border-border bg-muted/30 dark:bg-muted/10 p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Have an account?{' '}
                        <Link href="/login" className="text-secondary hover:text-secondary/80 font-medium">
                          Log in
                        </Link>{' '}
                        for a faster checkout.
                      </p>
                    </div>
                  )}

                  {user ? (
                    <div className="mt-4 rounded-lg border border-border bg-muted/30 dark:bg-muted/10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Not you?{' '}
                            <Link href="/logout" className="text-secondary hover:text-secondary/80">
                              Log out
                            </Link>
                          </p>
                        </div>
                        <CheckIcon className="size-5 text-secondary" />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <label
                        htmlFor="email-address"
                        className="block text-sm font-medium text-foreground"
                      >
                        Email address
                      </label>
                      <div className="mt-2">
                        <input
                          id="email-address"
                          name="email-address"
                          type="email"
                          autoComplete="email"
                          disabled={!emailEditable}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full rounded-md bg-background dark:bg-muted/10 px-3 py-2 text-base text-foreground border border-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="you@example.com"
                        />
                      </div>
                      {!emailEditable && (
                        <button
                          type="button"
                          onClick={() => setEmailEditable(true)}
                          className="mt-2 text-sm text-secondary hover:text-secondary/80"
                        >
                          Change email
                        </button>
                      )}
                    </div>
                  )}
                </section>

                {/* Address Section */}
                <section>
                  <h2 className="text-lg font-medium text-foreground">Billing address</h2>

                  {billingAddress ? (
                    <div className="mt-4 rounded-lg border border-border bg-muted/30 dark:bg-muted/10 p-4">
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
                    <div className="mt-4">
                      <CheckoutAddresses heading="" setAddress={setBillingAddress} />
                    </div>
                  ) : (
                    <div className="mt-4">
                      <CreateAddressModal
                        disabled={!email}
                        callback={(address) => {
                          setBillingAddress(address)
                        }}
                        skipSubmission={true}
                      />
                    </div>
                  )}
                </section>

                {/* Shipping Address Section */}
                <section>
                  <div className="flex items-center gap-3">
                    <input
                      id="shipping-same"
                      type="checkbox"
                      checked={billingAddressSameAsShipping}
                      onChange={(e) => setBillingAddressSameAsShipping(e.target.checked)}
                      className="size-4 rounded border-border text-secondary focus:ring-secondary"
                    />
                    <label htmlFor="shipping-same" className="text-sm text-foreground">
                      Shipping address same as billing
                    </label>
                  </div>

                  {!billingAddressSameAsShipping && (
                    <div className="mt-6">
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
                          <CheckoutAddresses
                            heading=""
                            description="Select a shipping address"
                            setAddress={setShippingAddress}
                          />
                        </div>
                      ) : (
                        <div className="mt-4">
                          <CreateAddressModal
                            callback={(address) => {
                              setShippingAddress(address)
                            }}
                            disabled={!email}
                            skipSubmission={true}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Continue Button */}
                <button
                  type="button"
                  disabled={!canGoToPayment}
                  onClick={() => {
                    if (!user && emailEditable) {
                      setEmailEditable(false)
                    }
                    void initiatePaymentIntent('stripe')
                  }}
                  className="w-full rounded-md bg-secondary px-4 py-3 text-base font-medium text-secondary-foreground shadow-sm hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  Continue to payment
                </button>

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

            {/* Step 1: Payment */}
            {isStep1 && paymentData?.['clientSecret'] ? (
              <div className="space-y-8">
                <section>
                  <h2 className="text-lg font-medium text-foreground">Payment details</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your card information to complete your purchase.
                  </p>

                  {error && (
                    <div className="mt-4">
                      <Message error={error} />
                    </div>
                  )}

                  <Suspense fallback={<React.Fragment />}>
                    <div className="mt-6">
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
                          billingAddress={billingAddress}
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
                  Back to contact & address
                </button>
              </div>
            ) : null}
          </div>

          {/* Right Column - Order Summary */}
          <div className="mx-auto w-full max-w-lg">
            <h2 className="text-lg font-medium text-foreground">Order summary</h2>

            <div className="mt-6 flow-root">
              <ul role="list" className="-my-6 divide-y divide-border">
                {cart?.items?.map((item, index) => {
                  if (typeof item.product === 'object' && item.product) {
                    const {
                      product,
                      product: { id, meta, title, gallery },
                      quantity,
                      variant,
                    } = item

                    if (!quantity) return null

                    let image = gallery?.[0]?.image || meta?.image
                    let price = product?.priceInGBP

                    const isVariant = Boolean(variant) && typeof variant === 'object'

                    if (isVariant) {
                      price = variant?.priceInGBP

                      const imageVariant = product.gallery?.find((item) => {
                        if (!item.variantOption) return false
                        const variantOptionID =
                          typeof item.variantOption === 'object'
                            ? item.variantOption.id
                            : item.variantOption

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
                      <li key={index} className="flex space-x-6 py-6">
                        <div className="size-24 flex-none rounded-md bg-muted dark:bg-muted/30 overflow-hidden relative">
                          {image && typeof image !== 'string' && (
                            <Media
                              fill
                              imgClassName="size-full object-cover"
                              resource={image}
                            />
                          )}
                        </div>
                        <div className="flex-auto">
                          <div className="space-y-1">
                            <h3 className="font-medium text-foreground">
                              <Link href={`/products/${product.slug}`}>{title}</Link>
                            </h3>
                            {typeof price === 'number' && (
                              <p className="text-foreground">
                                <Price amount={price} />
                              </p>
                            )}
                            {variant && typeof variant === 'object' && (
                              <p className="text-sm text-muted-foreground">
                                {variant.options
                                  ?.map((option) => {
                                    if (typeof option === 'object') return option.label
                                    return null
                                  })
                                  .join(', ')}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                          </div>
                        </div>
                      </li>
                    )
                  }
                  return null
                })}
              </ul>
            </div>

            <dl className="mt-10 space-y-4 text-sm font-medium text-muted-foreground">
              <div className="flex justify-between border-t border-border pt-4 text-foreground">
                <dt className="text-base">Total</dt>
                <dd className="text-base">
                  <Price amount={cart.subtotal || 0} />
                </dd>
              </div>
            </dl>

            {/* Continue Shopping Link */}
            <div className="mt-8">
              <Link
                href="/products"
                className="flex items-center gap-2 text-sm font-medium text-secondary hover:text-secondary/80"
              >
                <ArrowLeftIcon className="size-4" />
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
