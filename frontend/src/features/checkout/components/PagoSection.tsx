import { forwardRef, useImperativeHandle, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { Loader2, CreditCard, AlertCircle, Info } from 'lucide-react'
import {
  iniciarPago,
  capturarPayPal,
  confirmarTarjetaSimulada,
  type MetodoPago,
} from '@/features/checkout/api/checkoutApi'

export type PagoTab = 'PAYPAL' | 'TARJETA'

export interface PagoSectionHandle {
  /** Cobrar con tarjeta. Devuelve idFactura o null si falla la validación. */
  payCard: (direccionId: number) => Promise<string | null>
}

interface PagoSectionProps {
  tab: PagoTab
  onTabChange: (tab: PagoTab) => void
  /** Llamado cuando PayPal completa con éxito */
  onPayPalSuccess: (metodo: MetodoPago, idFactura: string) => void
  /** Resuelve la dirección (creando una nueva si el cliente tiene el form abierto). Devuelve null si la validación falla. */
  commitDireccion: () => Promise<number | null>
}

const PAYPAL_AVAILABLE = !!import.meta.env.VITE_PAYPAL_CLIENT_ID

export const PagoSection = forwardRef<PagoSectionHandle, PagoSectionProps>(function PagoSection(
  { tab, onTabChange, onPayPalSuccess, commitDireccion },
  ref,
) {
  const [error, setError] = useState<string | null>(null)
  const [card, setCard] = useState({ numero: '', titular: '', exp: '', cvv: '' })

  const [{ isPending, isRejected }] = usePayPalScriptReducer()

  // PayPal: crear orden (necesita dirección al momento del click)
  const createOrderMutation = useMutation({
    mutationFn: (direccionId: number) =>
      iniciarPago({ id_direccion_envio: direccionId, metodo_pago: 'PAYPAL' }),
  })

  const captureMutation = useMutation({
    mutationFn: ({ direccionId, paypal_order_id }: { direccionId: number; paypal_order_id: string }) =>
      capturarPayPal({ id_direccion_envio: direccionId, paypal_order_id }),
    onSuccess: (data) => onPayPalSuccess('PAYPAL', data.id_factura),
    onError: (e: Error) => setError(e.message || 'Error capturando pago PayPal'),
  })

  const tarjetaMutation = useMutation({
    mutationFn: (direccionId: number) =>
      confirmarTarjetaSimulada({ id_direccion_envio: direccionId }),
  })

  useImperativeHandle(ref, () => ({
    async payCard(direccionId: number) {
      setError(null)
      if (!card.numero || !card.titular || !card.exp || !card.cvv) {
        setError('Completa todos los campos de la tarjeta')
        return null
      }
      if (card.numero.length < 13) {
        setError('Número de tarjeta inválido')
        return null
      }
      try {
        const res = await tarjetaMutation.mutateAsync(direccionId)
        return res.id_factura
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error procesando tarjeta')
        return null
      }
    },
  }))

  return (
    <section
      id="seccion-pago"
      className="p-6 rounded-lg border border-border-base dark:border-border-base-dark bg-bg-card dark:bg-bg-card-dark"
    >
      <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
        Método de pago
      </h2>

      <div className="flex gap-2 mb-6 border-b border-border-base dark:border-border-base-dark">
        <TabButton
          active={tab === 'PAYPAL'}
          onClick={() => {
            onTabChange('PAYPAL')
            setError(null)
          }}
          icon={<PayPalLogoMark />}
          label="PayPal"
        />
        <TabButton
          active={tab === 'TARJETA'}
          onClick={() => {
            onTabChange('TARJETA')
            setError(null)
          }}
          icon={<CreditCard className="h-4 w-4" />}
          label="Tarjeta"
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded border border-status-danger dark:border-status-danger-dark bg-status-danger-bg dark:bg-status-danger-bg-dark flex items-start gap-2"
        >
          <AlertCircle className="h-4 w-4 text-status-danger dark:text-status-danger-dark flex-shrink-0 mt-0.5" />
          <p className="text-sm text-status-danger dark:text-status-danger-dark">{error}</p>
        </motion.div>
      )}

      {/* PayPal */}
      {tab === 'PAYPAL' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
            Paga de forma segura con tu cuenta PayPal o tarjeta sin necesidad de registrarte. Usa el botón de PayPal para finalizar.
          </p>

          {!PAYPAL_AVAILABLE && (
            <div className="p-3 rounded border border-status-warning dark:border-status-warning-dark bg-status-warning-bg dark:bg-status-warning-bg-dark text-sm text-status-warning dark:text-status-warning-dark flex items-start gap-2">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                PayPal no está configurado en este entorno. Usa Tarjeta para finalizar el pedido.
              </span>
            </div>
          )}

          {PAYPAL_AVAILABLE && isPending && (
            <div className="flex items-center gap-2 text-sm text-text-muted dark:text-text-muted-dark">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando PayPal…
            </div>
          )}

          {PAYPAL_AVAILABLE && isRejected && (
            <div className="p-3 rounded border border-status-danger dark:border-status-danger-dark bg-status-danger-bg dark:bg-status-danger-bg-dark text-sm text-status-danger dark:text-status-danger-dark">
              No se pudo cargar el SDK de PayPal. Intenta recargar la página o elige Tarjeta.
            </div>
          )}

          {PAYPAL_AVAILABLE && !isPending && !isRejected && (
            <div className="max-w-md">
              <PayPalButtons
                style={{ layout: 'vertical', shape: 'rect', label: 'paypal' }}
                disabled={captureMutation.isPending}
                createOrder={async () => {
                  setError(null)
                  const direccionId = await commitDireccion()
                  if (!direccionId) {
                    setError('Selecciona o completa una dirección de envío antes de pagar con PayPal')
                    throw new Error('Falta dirección')
                  }
                  const result = await createOrderMutation.mutateAsync(direccionId)
                  if (result.paypal_stub) {
                    setError(
                      'PayPal no está configurado en el servidor (modo demo). Usa Tarjeta para finalizar el pedido.',
                    )
                    throw new Error('PayPal en modo stub — backend sin credenciales')
                  }
                  if (!result.paypal_order_id) {
                    throw new Error('No se pudo crear la orden PayPal')
                  }
                  return result.paypal_order_id
                }}
                onApprove={async (data) => {
                  const direccionId = await commitDireccion()
                  if (!direccionId) {
                    setError('Falta dirección de envío')
                    return
                  }
                  await captureMutation.mutateAsync({
                    direccionId,
                    paypal_order_id: data.orderID,
                  })
                }}
                onError={(err) => {
                  setError(typeof err === 'object' && err && 'message' in err ? String(err.message) : 'Error en PayPal')
                }}
                onCancel={() => setError('Pago PayPal cancelado')}
              />
              {captureMutation.isPending && (
                <div className="mt-3 flex items-center gap-2 text-sm text-text-muted dark:text-text-muted-dark">
                  <Loader2 className="h-4 w-4 animate-spin" /> Confirmando pago…
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tarjeta */}
      {tab === 'TARJETA' && (
        <div className="space-y-4 max-w-md">
          <div className="p-3 rounded border border-border-base dark:border-border-base-dark bg-bg-hover/40 dark:bg-bg-hover-dark/40 text-xs text-text-muted dark:text-text-muted-dark flex items-start gap-2">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Pago con tarjeta simulado para demostración. No se envían datos reales de la tarjeta a ningún servidor.
            </span>
          </div>

          <Field
            label="Número de tarjeta"
            value={card.numero}
            onChange={(v) => setCard({ ...card, numero: v.replace(/\D/g, '').slice(0, 16) })}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
          />
          <Field
            label="Titular"
            value={card.titular}
            onChange={(v) => setCard({ ...card, titular: v.toUpperCase().slice(0, 40) })}
            placeholder="NOMBRE APELLIDO"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Vencimiento (MM/AA)"
              value={card.exp}
              onChange={(v) => {
                const clean = v.replace(/\D/g, '').slice(0, 4)
                const formatted = clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean
                setCard({ ...card, exp: formatted })
              }}
              placeholder="12/28"
              inputMode="numeric"
            />
            <Field
              label="CVV"
              value={card.cvv}
              onChange={(v) => setCard({ ...card, cvv: v.replace(/\D/g, '').slice(0, 4) })}
              placeholder="123"
              inputMode="numeric"
              type="password"
            />
          </div>
        </div>
      )}
    </section>
  )
})

// ─── Subcomponents ─────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? 'border-text-primary dark:border-text-primary-dark text-text-primary dark:text-text-primary-dark'
          : 'border-transparent text-text-muted dark:text-text-muted-dark hover:text-text-secondary dark:hover:text-text-secondary-dark'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  inputMode?: 'numeric' | 'text'
}) {
  return (
    <label className="block">
      <span className="block text-xs text-text-secondary dark:text-text-secondary-dark mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full px-3 py-2 rounded border border-border-base dark:border-border-base-dark bg-bg-base dark:bg-bg-base-dark text-sm text-text-primary dark:text-text-primary-dark focus:outline-none focus:border-text-primary dark:focus:border-text-primary-dark"
      />
    </label>
  )
}

function PayPalLogoMark() {
  return (
    <span className="inline-flex items-center justify-center h-4 px-1.5 rounded text-[10px] font-bold bg-[#003087] text-white">
      Pal
    </span>
  )
}
