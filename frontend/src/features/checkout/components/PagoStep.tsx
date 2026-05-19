import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { Loader2, CreditCard, Building2, ChevronLeft, AlertCircle, Info, CheckCircle2 } from 'lucide-react'
import {
  iniciarPago,
  capturarPayPal,
  confirmarTarjetaSimulada,
  type MetodoPago,
  type IniciarPagoResponse,
} from '@/features/checkout/api/checkoutApi'

interface PagoStepProps {
  direccionId: number
  onSuccess: (metodo: MetodoPago, idFactura: string) => void
  onBack: () => void
}

type Tab = 'PAYPAL' | 'TARJETA' | 'TRANSFERENCIA'

const PAYPAL_AVAILABLE = !!import.meta.env.VITE_PAYPAL_CLIENT_ID

export function PagoStep({ direccionId, onSuccess, onBack }: PagoStepProps) {
  const [tab, setTab] = useState<Tab>(PAYPAL_AVAILABLE ? 'PAYPAL' : 'TARJETA')
  const [error, setError] = useState<string | null>(null)
  const [transferencia, setTransferencia] = useState<IniciarPagoResponse | null>(null)

  // PayPal SDK status (for nicer fallback messaging)
  const [{ isPending, isRejected }] = usePayPalScriptReducer()

  // ─── PayPal: crear orden ────────────────────────────────────────────────
  const createOrderMutation = useMutation({
    mutationFn: () => iniciarPago({ id_direccion_envio: direccionId, metodo_pago: 'PAYPAL' }),
  })

  // ─── PayPal: capturar ───────────────────────────────────────────────────
  const captureMutation = useMutation({
    mutationFn: (paypal_order_id: string) =>
      capturarPayPal({ id_direccion_envio: direccionId, paypal_order_id }),
    onSuccess: (data) => onSuccess('PAYPAL', data.id_factura),
    onError: (e: Error) => setError(e.message || 'Error capturando pago PayPal'),
  })

  // ─── Tarjeta simulada ───────────────────────────────────────────────────
  const tarjetaMutation = useMutation({
    mutationFn: () => confirmarTarjetaSimulada({ id_direccion_envio: direccionId }),
    onSuccess: (data) => onSuccess('TARJETA', data.id_factura),
    onError: (e: Error) => setError(e.message || 'Error procesando tarjeta'),
  })

  // ─── Transferencia ──────────────────────────────────────────────────────
  const transferenciaMutation = useMutation({
    mutationFn: () =>
      iniciarPago({ id_direccion_envio: direccionId, metodo_pago: 'TRANSFERENCIA' }),
    onSuccess: (data) => {
      setTransferencia(data)
    },
    onError: (e: Error) => setError(e.message || 'Error generando orden de transferencia'),
  })

  const [card, setCard] = useState({ numero: '', titular: '', exp: '', cvv: '' })

  const handleTarjetaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!card.numero || !card.titular || !card.exp || !card.cvv) {
      setError('Completa todos los campos de la tarjeta')
      return
    }
    tarjetaMutation.mutate()
  }

  return (
    <div className="p-6 rounded-lg border border-border-base dark:border-border-base-dark bg-bg-card dark:bg-bg-card-dark">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
          Método de pago
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark"
        >
          <ChevronLeft className="h-4 w-4" /> Cambiar dirección
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border-base dark:border-border-base-dark">
        <TabButton
          active={tab === 'PAYPAL'}
          onClick={() => {
            setTab('PAYPAL')
            setError(null)
            setTransferencia(null)
          }}
          icon={<PayPalLogoMark />}
          label="PayPal"
        />
        <TabButton
          active={tab === 'TARJETA'}
          onClick={() => {
            setTab('TARJETA')
            setError(null)
            setTransferencia(null)
          }}
          icon={<CreditCard className="h-4 w-4" />}
          label="Tarjeta"
        />
        <TabButton
          active={tab === 'TRANSFERENCIA'}
          onClick={() => {
            setTab('TRANSFERENCIA')
            setError(null)
          }}
          icon={<Building2 className="h-4 w-4" />}
          label="Transferencia"
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

      {/* ─── PayPal ──────────────────────────────────────────────────── */}
      {tab === 'PAYPAL' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
            Paga de forma segura con tu cuenta PayPal o tarjeta sin necesidad de registrarte.
          </p>

          {!PAYPAL_AVAILABLE && (
            <div className="p-3 rounded border border-status-warning dark:border-status-warning-dark bg-status-warning-bg dark:bg-status-warning-bg-dark text-sm text-status-warning dark:text-status-warning-dark flex items-start gap-2">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                PayPal no está configurado en este entorno. Usa Tarjeta o Transferencia.
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
              No se pudo cargar el SDK de PayPal. Intenta recargar la página o elige otro método.
            </div>
          )}

          {PAYPAL_AVAILABLE && !isPending && !isRejected && (
            <div className="max-w-md">
              <PayPalButtons
                style={{ layout: 'vertical', shape: 'rect', label: 'paypal' }}
                disabled={captureMutation.isPending}
                createOrder={async () => {
                  setError(null)
                  const result = await createOrderMutation.mutateAsync()
                  if (!result.paypal_order_id) {
                    throw new Error('No se pudo crear la orden PayPal')
                  }
                  return result.paypal_order_id
                }}
                onApprove={async (data) => {
                  await captureMutation.mutateAsync(data.orderID)
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

      {/* ─── Tarjeta simulada ─────────────────────────────────────────── */}
      {tab === 'TARJETA' && (
        <form onSubmit={handleTarjetaSubmit} className="space-y-4 max-w-md">
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

          <button
            type="submit"
            disabled={tarjetaMutation.isPending}
            className="w-full py-2.5 rounded bg-text-primary dark:bg-text-primary-dark text-bg-base dark:text-bg-base-dark text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {tarjetaMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Procesando…
              </>
            ) : (
              'Pagar con tarjeta'
            )}
          </button>
        </form>
      )}

      {/* ─── Transferencia ───────────────────────────────────────────── */}
      {tab === 'TRANSFERENCIA' && (
        <div className="space-y-4 max-w-md">
          {!transferencia ? (
            <>
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                Generamos una orden con estado pendiente. Recibirás los datos bancarios para realizar la transferencia.
              </p>
              <button
                type="button"
                onClick={() => transferenciaMutation.mutate()}
                disabled={transferenciaMutation.isPending}
                className="w-full py-2.5 rounded border border-text-primary dark:border-text-primary-dark text-text-primary dark:text-text-primary-dark text-sm font-medium hover:bg-bg-hover dark:hover:bg-bg-hover-dark disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {transferenciaMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generando orden…
                  </>
                ) : (
                  'Generar orden de transferencia'
                )}
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-status-success dark:text-status-success-dark">
                <CheckCircle2 className="h-4 w-4" /> Orden creada
              </div>
              {transferencia.instrucciones_transferencia && (
                <div className="p-4 rounded border border-border-base dark:border-border-base-dark space-y-1.5 text-sm">
                  <Row k="Banco" v={transferencia.instrucciones_transferencia.banco} />
                  <Row k="Cuenta" v={`${transferencia.instrucciones_transferencia.tipo} ${transferencia.instrucciones_transferencia.cuenta}`} />
                  <Row k="Beneficiario" v={transferencia.instrucciones_transferencia.beneficiario} />
                  <Row k="RUC" v={transferencia.instrucciones_transferencia.ruc} />
                  <Row k="Referencia" v={transferencia.instrucciones_transferencia.referencia} />
                </div>
              )}
              <button
                type="button"
                onClick={() => transferencia.id_factura && onSuccess('TRANSFERENCIA', transferencia.id_factura)}
                className="w-full py-2.5 rounded bg-text-primary dark:bg-text-primary-dark text-bg-base dark:text-bg-base-dark text-sm font-medium hover:opacity-90"
              >
                Ver confirmación de pedido
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-text-muted dark:text-text-muted-dark">{k}</span>
      <span className="text-text-primary dark:text-text-primary-dark font-medium">{v}</span>
    </div>
  )
}

function PayPalLogoMark() {
  return (
    <span className="inline-flex items-center justify-center h-4 px-1.5 rounded text-[10px] font-bold bg-[#003087] text-white">
      Pal
    </span>
  )
}
