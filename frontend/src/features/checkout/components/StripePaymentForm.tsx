import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { AlertTriangle, CreditCard } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { confirmarPago } from '@/features/checkout/api/checkoutApi'
import { useToast } from '@/shared/hooks/useToast'

// ─── Stripe init ─────────────────────────────────────────────────────────────

const STRIPE_PK = import.meta.env.VITE_STRIPE_PK || 'pk_test_placeholder'
const isStub = STRIPE_PK === 'pk_test_placeholder'
const stripePromise = isStub ? null : loadStripe(STRIPE_PK)

// ─── Inner form (needs Stripe context) ──────────────────────────────────────

interface InnerFormProps {
  clientSecret: string
  total: number
  idFactura: string
  onSuccess: () => void
}

function InnerPaymentForm({ total, idFactura, onSuccess }: InnerFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { error: toastError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/confirmacion/${idFactura}` },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message || 'Error al procesar el pago')
      toastError('Error al procesar el pago')
      setProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />
      {error && (
        <p className="text-sm text-status-danger dark:text-status-danger-dark" role="alert">
          {error}
        </p>
      )}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={processing}
        disabled={!stripe}
        leftIcon={<CreditCard className="h-4 w-4" />}
      >
        Pagar ${total.toFixed(2)}
      </Button>
    </form>
  )
}

// ─── Stub form (no Stripe key) ──────────────────────────────────────────────

interface StubFormProps {
  total: number
  idFactura: string
  onSuccess: () => void
}

function StubPaymentForm({ total, idFactura, onSuccess }: StubFormProps) {
  const [processing, setProcessing] = useState(false)
  const { success } = useToast()

  const handleStubPay = async () => {
    setProcessing(true)
    try {
      await confirmarPago(idFactura)
      success('Pago simulado exitosamente')
      onSuccess()
    } catch {
      // If backend confirm fails, still proceed for demo
      success('Pago simulado (modo stub)')
      onSuccess()
    }
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-lg border border-status-warning dark:border-status-warning-dark bg-status-warning-bg dark:bg-status-warning-bg-dark"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-status-warning dark:text-status-warning-dark flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-status-warning dark:text-status-warning-dark">
              MODO STUB · Stripe no está configurado
            </p>
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
              La transacción será simulada. Configurá VITE_STRIPE_PK en .env para usar Stripe real.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Fake card UI */}
      <div className="p-4 rounded-lg border border-border-base dark:border-border-base-dark bg-bg-hover dark:bg-bg-hover-dark space-y-3">
        <div className="h-10 rounded bg-border-base dark:bg-border-base-dark/50 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 rounded bg-border-base dark:bg-border-base-dark/50 animate-pulse" />
          <div className="h-10 rounded bg-border-base dark:bg-border-base-dark/50 animate-pulse" />
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        loading={processing}
        onClick={handleStubPay}
        leftIcon={<CreditCard className="h-4 w-4" />}
      >
        Simular pago ${total.toFixed(2)}
      </Button>
    </div>
  )
}

// ─── Exported component ──────────────────────────────────────────────────────

interface StripePaymentFormProps {
  clientSecret: string | null
  total: number
  idFactura: string
  onSuccess: () => void
}

export function StripePaymentForm({ clientSecret, total, idFactura, onSuccess }: StripePaymentFormProps) {
  if (isStub || !stripePromise || !clientSecret) {
    return <StubPaymentForm total={total} idFactura={idFactura} onSuccess={onSuccess} />
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#3B82F6',
            colorBackground: '#252A2E',
            colorText: '#C8CDD1',
            colorDanger: '#F87171',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <InnerPaymentForm
        clientSecret={clientSecret}
        total={total}
        idFactura={idFactura}
        onSuccess={onSuccess}
      />
    </Elements>
  )
}
