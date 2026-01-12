'use client'

// TailwindPlus styled checkout steps progress indicator
// Adapted for: React, Tailwind v4, dark mode support

import { CheckIcon } from '@heroicons/react/24/solid'

type Step = {
  id: string
  name: string
  description: string
  status: 'complete' | 'current' | 'upcoming'
}

type Props = {
  currentStep: number
  onStepClick?: (step: number) => void
}

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export const CheckoutSteps: React.FC<Props> = ({ currentStep, onStepClick }) => {
  const steps: Step[] = [
    {
      id: '01',
      name: 'Contact & Address',
      description: 'Your details and shipping address',
      status: currentStep > 0 ? 'complete' : currentStep === 0 ? 'current' : 'upcoming',
    },
    {
      id: '02',
      name: 'Payment',
      description: 'Enter your payment details',
      status: currentStep > 1 ? 'complete' : currentStep === 1 ? 'current' : 'upcoming',
    },
    {
      id: '03',
      name: 'Confirmation',
      description: 'Review and place your order',
      status: currentStep > 2 ? 'complete' : currentStep === 2 ? 'current' : 'upcoming',
    },
  ]

  return (
    <div className="lg:border-t lg:border-b lg:border-border">
      <nav aria-label="Progress" className="mx-auto max-w-7xl">
        <ol
          role="list"
          className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-r lg:border-l lg:border-border"
        >
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="relative overflow-hidden lg:flex-1">
              <div
                className={classNames(
                  stepIdx === 0 ? 'rounded-t-md border-b-0' : '',
                  stepIdx === steps.length - 1 ? 'rounded-b-md border-t-0' : '',
                  'overflow-hidden border border-border lg:border-0',
                )}
              >
                {step.status === 'complete' ? (
                  <button
                    type="button"
                    onClick={() => onStepClick?.(stepIdx)}
                    className="group w-full text-left"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 h-full w-1 bg-transparent group-hover:bg-muted lg:top-auto lg:bottom-0 lg:h-1 lg:w-full"
                    />
                    <span
                      className={classNames(
                        stepIdx !== 0 ? 'lg:pl-9' : '',
                        'flex items-start px-6 py-5 text-sm font-medium',
                      )}
                    >
                      <span className="shrink-0">
                        <span className="flex size-10 items-center justify-center rounded-full bg-secondary">
                          <CheckIcon aria-hidden="true" className="size-6 text-secondary-foreground" />
                        </span>
                      </span>
                      <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                        <span className="text-sm font-medium text-foreground">{step.name}</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {step.description}
                        </span>
                      </span>
                    </span>
                  </button>
                ) : step.status === 'current' ? (
                  <div aria-current="step">
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 h-full w-1 bg-secondary lg:top-auto lg:bottom-0 lg:h-1 lg:w-full"
                    />
                    <span
                      className={classNames(
                        stepIdx !== 0 ? 'lg:pl-9' : '',
                        'flex items-start px-6 py-5 text-sm font-medium',
                      )}
                    >
                      <span className="shrink-0">
                        <span className="flex size-10 items-center justify-center rounded-full border-2 border-secondary">
                          <span className="text-secondary">{step.id}</span>
                        </span>
                      </span>
                      <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                        <span className="text-sm font-medium text-secondary">{step.name}</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {step.description}
                        </span>
                      </span>
                    </span>
                  </div>
                ) : (
                  <div>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-0 h-full w-1 bg-transparent lg:top-auto lg:bottom-0 lg:h-1 lg:w-full"
                    />
                    <span
                      className={classNames(
                        stepIdx !== 0 ? 'lg:pl-9' : '',
                        'flex items-start px-6 py-5 text-sm font-medium',
                      )}
                    >
                      <span className="shrink-0">
                        <span className="flex size-10 items-center justify-center rounded-full border-2 border-muted">
                          <span className="text-muted-foreground">{step.id}</span>
                        </span>
                      </span>
                      <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                        <span className="text-sm font-medium text-muted-foreground">{step.name}</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {step.description}
                        </span>
                      </span>
                    </span>
                  </div>
                )}

                {stepIdx !== 0 ? (
                  <>
                    {/* Separator */}
                    <div aria-hidden="true" className="absolute inset-0 top-0 left-0 hidden w-3 lg:block">
                      <svg
                        fill="none"
                        viewBox="0 0 12 82"
                        preserveAspectRatio="none"
                        className="size-full text-border"
                      >
                        <path
                          d="M0.5 0V31L10.5 41L0.5 51V82"
                          stroke="currentcolor"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </div>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
