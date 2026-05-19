import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { useCheckout } from '@/features/checkout/hooks/useCheckout'
import {
  DireccionSection,
  type DireccionSectionHandle,
} from '@/features/checkout/components/DireccionSection'
import {
  PagoSection,
  type PagoSectionHandle,
  type PagoTab,
} from '@/features/checkout/components/PagoSection'
import { ResumenOrden } from '@/features/checkout/components/ResumenOrden'
import { validarCarrito, type CheckoutValidacion } from '@/features/checkout/api/checkoutApi'
import { getDirecciones, type Direccion } from '@/features/cuenta/api/cuentaApi'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'

const PAYPAL_AVAILABLE = !!import.meta.env.VITE_PAYPAL_CLIENT_ID

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCarritoStore((s) => s.items)
  const getTotal = useCarritoStore((s) => s.getTotal)

  const { direccionId, setDireccion, setMetodoPago, setIdFactura } = useCheckout()

  const direccionRef = useRef<DireccionSectionHandle>(null)
  const pagoRef = useRef<PagoSectionHandle>(null)

  const commitDireccion = () =>
    direccionRef.current ? direccionRef.current.commit() : Promise.resolve(null)

  const [tab, setTab] = useState<PagoTab>(PAYPAL_AVAILABLE ? 'PAYPAL' : 'TARJETA')
  const [validationErrors, setValidationErrors] = useState<CheckoutValidacion['errors']>([])
  const [dismissedWarning, setDismissedWarning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  useEffect(() => {
    if (items.length === 0) navigate('/carrito', { replace: true })
  }, [items.length, navigate])

  useQuery({
    queryKey: ['checkout-validation'],
    queryFn: async () => {
      const result = await validarCarrito()
      setValidationErrors(result.valid ? [] : result.errors)
      return result
    },
    staleTime: 0,
  })

  const { data: direcciones = [] } = useQuery({
    queryKey: ['direcciones'],
    queryFn: getDirecciones,
  })

  const selectedDir = direcciones.find((d: Direccion) => d.id === direccionId)
  const direccionLabel = selectedDir
    ? `${selectedDir.alias} — ${selectedDir.direccion}`
    : undefined

  const total = getTotal()

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handlePayPalSuccess = (metodo: 'PAYPAL' | 'TARJETA' | 'TRANSFERENCIA', id: string) => {
    setMetodoPago(metodo)
    setIdFactura(id)
    navigate(`/checkout/confirmacion/${id}`)
  }

  const handlePagar = async () => {
    if (validationErrors.length > 0) {
      setDismissedWarning(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setGlobalError(null)
    setSubmitting(true)
    try {
      const dirId = await direccionRef.current?.commit()
      if (!dirId) {
        scrollToSection('seccion-direccion')
        return
      }
      const idFactura = await pagoRef.current?.payCard(dirId)
      if (!idFactura) {
        scrollToSection('seccion-pago')
        return
      }
      setMetodoPago('TARJETA')
      setIdFactura(idFactura)
      navigate(`/checkout/confirmacion/${idFactura}`)
    } catch (e) {
      setGlobalError(e instanceof Error ? e.message : 'No pudimos procesar el pago')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 py-8 pb-32">
      <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
        Checkout
      </h1>

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
                      <li
                        key={err.idItem ?? `err-${i}`}
                        className="text-xs text-text-secondary dark:text-text-secondary-dark"
                      >
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DireccionSection
            ref={direccionRef}
            selectedId={direccionId}
            onSelect={setDireccion}
          />
          <PagoSection
            ref={pagoRef}
            tab={tab}
            onTabChange={setTab}
            onPayPalSuccess={handlePayPalSuccess}
            commitDireccion={commitDireccion}
          />
        </div>

        <div className="lg:col-span-1">
          <ResumenOrden direccionLabel={direccionLabel} />
        </div>
      </div>

      {/* Sticky bottom Pagar bar (solo Tarjeta — PayPal usa su propio botón nativo arriba) */}
      {tab === 'TARJETA' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-bg-surface/95 dark:bg-bg-surface-dark/95 backdrop-blur border-t border-border-base dark:border-border-base-dark">
          <div className="max-w-content mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-xs text-text-muted dark:text-text-muted-dark">Total a pagar</p>
              <p className="text-lg font-semibold text-text-primary dark:text-text-primary-dark tabular-nums">
                ${total.toFixed(2)}
              </p>
            </div>
            <div className="flex-1 sm:flex-initial sm:ml-auto flex flex-col items-end gap-1 w-full sm:w-auto">
              {globalError && (
                <p className="text-xs text-status-danger dark:text-status-danger-dark">
                  {globalError}
                </p>
              )}
              <button
                type="button"
                onClick={handlePagar}
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-accent text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Procesando…
                  </>
                ) : (
                  `Pagar $${total.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
