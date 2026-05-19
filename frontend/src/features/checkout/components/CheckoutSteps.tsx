import { Check } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { CheckoutStep } from '@/features/checkout/hooks/useCheckout'

const steps: { key: CheckoutStep; label: string }[] = [
  { key: 'direccion', label: 'Dirección' },
  { key: 'pago', label: 'Pago' },
  { key: 'confirmacion', label: 'Confirmación' },
]

interface CheckoutStepsProps {
  currentStep: CheckoutStep
  stepIndex: number
  onStepClick: (step: CheckoutStep) => void
  isStepCompleted: (step: CheckoutStep) => boolean
}

export function CheckoutSteps({
  currentStep,
  stepIndex,
  onStepClick,
  isStepCompleted,
}: CheckoutStepsProps) {
  return (
    <nav className="flex items-center justify-center gap-0 mb-8" aria-label="Pasos del checkout">
      {steps.map((step, i) => {
        const completed = isStepCompleted(step.key)
        const isCurrent = step.key === currentStep
        const clickable = i < stepIndex

        return (
          <div key={step.key} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
            {/* Step dot + label */}
            <button
              type="button"
              onClick={() => clickable && onStepClick(step.key)}
              disabled={!clickable}
              className={cn(
                'flex flex-col items-center gap-1.5 transition-colors',
                clickable && 'cursor-pointer',
                !clickable && !isCurrent && 'cursor-default',
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all border-2',
                  completed && 'bg-accent border-accent text-white',
                  isCurrent && 'border-accent text-accent bg-accent/10',
                  !completed && !isCurrent && 'border-border-base dark:border-border-base-dark text-text-muted dark:text-text-muted-dark',
                )}
              >
                {completed ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isCurrent && 'text-accent',
                  completed && 'text-text-primary dark:text-text-primary-dark',
                  !completed && !isCurrent && 'text-text-muted dark:text-text-muted-dark',
                )}
              >
                {step.label}
              </span>
            </button>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-3 mt-[-18px]',
                  completed ? 'bg-accent' : 'bg-border-base dark:bg-border-base-dark',
                )}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
