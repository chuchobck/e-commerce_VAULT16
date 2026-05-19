import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useCheckout } from '@/features/checkout/hooks/useCheckout'
import { CheckoutSteps } from '@/features/checkout/components/CheckoutSteps'
import { DireccionStep } from '@/features/checkout/components/DireccionStep'
import { PagoStep } from '@/features/checkout/components/PagoStep'
import { ResumenOrden } from '@/features/checkout/components/ResumenOrden'
import { validarCarrito, type CheckoutValidacion } from '@/features/checkout/api/checkoutApi'
import { getDirecciones, type Direccion } from '@/features/cuenta/api/cuentaApi'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCarritoStore((s) => s.items)

  const {
    currentStep,
    stepIndex,
    direccionId,
    setDireccion,
    setMetodoPago,
    setIdFactura,
    nextStep,
    prevStep,
    goToStep,
    isStepCompleted,
  } = useCheckout()

  const [validationErrors, setValidationErrors] = useState<CheckoutValidacion['errors']>([])
  const [dismissedWarning, setDismissedWarning] = useState(false)

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrito', { replace: true })
    }
  }, [items.length, navigate])

  // Validate cart on mount
  useQuery({
    queryKey: ['checkout-validation'],
    queryFn: async () => {
      const result = await validarCarrito()
      if (!result.valid) {
        setValidationErrors(result.errors)
      }
      return result
    },
    staleTime: 0,
  })

  // Get addresses for label display
  const { data: direcciones = [] } = useQuery({
    queryKey: ['direcciones'],
    queryFn: getDirecciones,
  })

  const selectedDir = direcciones.find((d: Direccion) => d.id === direccionId)
  const direccionLabel = selectedDir ? `${selectedDir.alias} — ${selectedDir.direccion}` : undefined

  const handleDireccionContinue = useCallback(() => {
    if (validationErrors.length > 0) {
      // Force the warning back if it was dismissed so the user sees why
      setDismissedWarning(false)
      return
    }
    nextStep()
  }, [nextStep, validationErrors.length])

  const handlePagoSuccess = useCallback(
    (metodo: 'PAYPAL' | 'TARJETA' | 'TRANSFERENCIA', idFactura: string) => {
      setMetodoPago(metodo)
      setIdFactura(idFactura)
      navigate(`/checkout/confirmacion/${idFactura}`)
    },
    [setMetodoPago, setIdFactura, navigate],
  )

  if (items.length === 0) return null

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
      {/* Validation warnings */}
      <AnimatePresence>
        {validationErrors.length > 0 && !dismissedWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-lg border border-status-warning dark:border-status-warning-dark bg-status-warning-bg dark:bg-status-warning-bg-dark"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-status-warning dark:text-status-warning-dark flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-status-warning dark:text-status-warning-dark mb-1">
                    Algunos productos tienen cambios
                  </p>
                  <ul className="space-y-1">
                    {validationErrors.map((err, i) => (
                      <li key={err.idItem ?? `err-${i}`} className="text-xs text-text-secondary dark:text-text-secondary-dark">
                        {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissedWarning(true)}
                className="text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stepper */}
      <CheckoutSteps
        currentStep={currentStep}
        stepIndex={stepIndex}
        onStepClick={goToStep}
        isStepCompleted={isStepCompleted}
      />

      {/* Content: step + summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {currentStep === 'direccion' && (
              <motion.div
                key="dir"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <DireccionStep
                  selectedId={direccionId}
                  onSelect={setDireccion}
                  onContinue={handleDireccionContinue}
                />
              </motion.div>
            )}

            {currentStep === 'pago' && direccionId && (
              <motion.div
                key="pago"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <PagoStep
                  direccionId={direccionId}
                  onSuccess={handlePagoSuccess}
                  onBack={prevStep}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <ResumenOrden
            direccionLabel={direccionLabel}
            metodoPago={null}
            onEditStep={goToStep}
            currentStep={currentStep}
          />
        </div>
      </div>
    </div>
  )
}
