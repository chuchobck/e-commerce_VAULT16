import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Building2, ArrowLeft, Star } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { StripePaymentForm } from './StripePaymentForm'
import { useCreatePaymentIntent } from '@/features/checkout/hooks/useCreatePaymentIntent'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'
import { useToast } from '@/shared/hooks/useToast'
import { cn } from '@/shared/utils/cn'

type MetodoPago = 'TARJETA' | 'TRANSFERENCIA'

interface PagoStepProps {
  direccionId: number
  onSuccess: (metodo: MetodoPago, idFactura: string) => void
  onBack: () => void
}

export function PagoStep({ direccionId, onSuccess, onBack }: PagoStepProps) {
  const [metodo, setMetodo] = useState<MetodoPago>('TARJETA')
  const [started, setStarted] = useState(false)
  const { createIntentAsync, data: intentData, isPending } = useCreatePaymentIntent()
  const getTotal = useCarritoStore((s) => s.getTotal)
  const total = getTotal()
  const { error } = useToast()

  const handleStartPayment = async () => {
    try {
      const result = await createIntentAsync({ direccionId, metodoPago: metodo })
      setStarted(true)

      if (metodo === 'TRANSFERENCIA') {
        onSuccess('TRANSFERENCIA', result.idFactura)
      }
    } catch {
      error('No pudimos iniciar el pago')
    }
  }

  const handleStripeSuccess = () => {
    if (intentData) {
      onSuccess('TARJETA', intentData.idFactura)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-md text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
          Método de pago
        </h3>
      </div>

      {/* Method selector */}
      {!started && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setMetodo('TARJETA')}
            className={cn(
              'w-full text-left p-4 rounded-lg border-2 transition-all',
              metodo === 'TARJETA'
                ? 'border-accent bg-accent/5'
                : 'border-border-base dark:border-border-base-dark bg-bg-card dark:bg-bg-card-dark hover:border-accent/40',
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className={cn('h-5 w-5', metodo === 'TARJETA' ? 'text-accent' : 'text-text-muted dark:text-text-muted-dark')} />
                <div>
                  <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                    Tarjeta de crédito/débito
                  </span>
                  <p className="text-xs text-text-muted dark:text-text-muted-dark">Visa, Mastercard, AMEX</p>
                </div>
              </div>
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded">
                <Star className="h-3 w-3" />
                Recomendado
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMetodo('TRANSFERENCIA')}
            className={cn(
              'w-full text-left p-4 rounded-lg border-2 transition-all',
              metodo === 'TRANSFERENCIA'
                ? 'border-accent bg-accent/5'
                : 'border-border-base dark:border-border-base-dark bg-bg-card dark:bg-bg-card-dark hover:border-accent/40',
            )}
          >
            <div className="flex items-center gap-3">
              <Building2 className={cn('h-5 w-5', metodo === 'TRANSFERENCIA' ? 'text-accent' : 'text-text-muted dark:text-text-muted-dark')} />
              <div>
                <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                  Transferencia bancaria
                </span>
                <p className="text-xs text-text-muted dark:text-text-muted-dark">Depósito o transferencia</p>
              </div>
            </div>
          </button>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            onClick={handleStartPayment}
          >
            {metodo === 'TARJETA' ? 'Continuar con tarjeta' : 'Generar orden de pago'}
          </Button>
        </div>
      )}

      {/* Stripe form (shown after intent created) */}
      {started && metodo === 'TARJETA' && intentData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <StripePaymentForm
            clientSecret={intentData.clientSecret}
            total={total}
            idFactura={intentData.idFactura}
            onSuccess={handleStripeSuccess}
          />
        </motion.div>
      )}
    </div>
  )
}
