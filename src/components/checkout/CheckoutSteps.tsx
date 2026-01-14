'use client'

// TailwindPlus styled checkout steps progress indicator
// Adapted for: React, Tailwind v4, dark mode support
// Unified pill-style design for both mobile and desktop

import { CheckIcon } from '@heroicons/react/24/solid'

type Step = {
  id: string
  name: string
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
      name: 'Shipping',
      status: currentStep > 0 ? 'complete' : currentStep === 0 ? 'current' : 'upcoming',
    },
    {
      id: '02',
      name: 'Payment',
      status: currentStep > 1 ? 'complete' : currentStep === 1 ? 'current' : 'upcoming',
    },
  ]

  return (
    <nav aria-label="Checkout progress" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-3 lg:py-4">
        <div className="flex items-center justify-center gap-3 lg:gap-4">
          {steps.map((step, stepIdx) => (
            <div key={step.id} className="flex items-center gap-3 lg:gap-4">
              <button
                type="button"
                onClick={() => step.status === 'complete' && onStepClick?.(stepIdx)}
                disabled={step.status !== 'complete'}
                className={classNames(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  step.status === 'complete'
                    ? 'bg-secondary/10 text-secondary cursor-pointer hover:bg-secondary/20'
                    : step.status === 'current'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {step.status === 'complete' ? (
                  <CheckIcon className="size-4" />
                ) : (
                  <span className="size-5 flex items-center justify-center rounded-full bg-current/20 text-xs font-semibold">
                    {stepIdx + 1}
                  </span>
                )}
                {step.name}
              </button>
              {stepIdx < steps.length - 1 && (
                <div className="w-8 lg:w-12 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
