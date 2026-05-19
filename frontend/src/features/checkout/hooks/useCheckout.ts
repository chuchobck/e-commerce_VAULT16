import { useState, useCallback } from 'react'

export type CheckoutStep = 'direccion' | 'pago' | 'confirmacion'

const STEPS: CheckoutStep[] = ['direccion', 'pago', 'confirmacion']

interface UseCheckoutReturn {
  currentStep: CheckoutStep
  stepIndex: number
  direccionId: number | null
  metodoPago: 'TARJETA' | 'TRANSFERENCIA' | null
  idFactura: string | null

  setDireccion: (id: number) => void
  setMetodoPago: (m: 'TARJETA' | 'TRANSFERENCIA') => void
  setIdFactura: (id: string) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: CheckoutStep) => void
  isStepCompleted: (step: CheckoutStep) => boolean
}

export function useCheckout(): UseCheckoutReturn {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('direccion')
  const [direccionId, setDireccionId] = useState<number | null>(null)
  const [metodoPago, setMetodo] = useState<'TARJETA' | 'TRANSFERENCIA' | null>(null)
  const [idFactura, setIdFact] = useState<string | null>(null)

  const stepIndex = STEPS.indexOf(currentStep)

  const nextStep = useCallback(() => {
    const idx = STEPS.indexOf(currentStep)
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1])
  }, [currentStep])

  const prevStep = useCallback(() => {
    const idx = STEPS.indexOf(currentStep)
    if (idx > 0) setCurrentStep(STEPS[idx - 1])
  }, [currentStep])

  const goToStep = useCallback(
    (step: CheckoutStep) => {
      const targetIdx = STEPS.indexOf(step)
      if (targetIdx <= stepIndex) setCurrentStep(step)
    },
    [stepIndex],
  )

  const isStepCompleted = useCallback(
    (step: CheckoutStep) => {
      const idx = STEPS.indexOf(step)
      return idx < stepIndex
    },
    [stepIndex],
  )

  return {
    currentStep,
    stepIndex,
    direccionId,
    metodoPago,
    idFactura,
    setDireccion: setDireccionId,
    setMetodoPago: setMetodo,
    setIdFactura: setIdFact,
    nextStep,
    prevStep,
    goToStep,
    isStepCompleted,
  }
}
