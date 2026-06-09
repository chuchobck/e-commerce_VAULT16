import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { RotateCcw } from 'lucide-react'
import { EstadoTimeline } from './EstadoTimeline'
import type { Pedido } from '@/features/pedidos/api/pedidosApi'
import { addItem } from '@/features/carrito/api/carritoApi'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'
import { useUIStore } from '@/shared/stores/uiStore'
import { useToast } from '@/shared/hooks/useToast'
import { Button } from '@/shared/components/ui/Button'

const ESTADOS_EXITOSOS = new Set(['PAG', 'ENT'])

interface PedidoDetalleProps {
  pedido: Pedido
}

export function PedidoDetalle({ pedido }: PedidoDetalleProps) {
  const fecha = format(new Date(pedido.fecha), "d 'de' MMMM yyyy, HH:mm", { locale: es })
  const [isRepeating, setIsRepeating] = useState(false)
  const setItems = useCarritoStore((s) => s.setItems)
  const openCartDrawer = useUIStore((s) => s.openCartDrawer)
  const { success, error } = useToast()

  const handleRepetirPedido = async () => {
    setIsRepeating(true)
    let lastResult = null
    let errCount = 0
    for (const item of pedido.items) {
      if (!item.varianteId) continue
      try {
        lastResult = await addItem({ id_variante: item.varianteId, cantidad: item.cantidad })
      } catch {
        errCount++
      }
    }
    if (lastResult) setItems(lastResult)
    setIsRepeating(false)
    if (errCount === 0) {
      success('Productos agregados al carrito')
    } else if (errCount < pedido.items.length) {
      success(`Algunos productos no estaban disponibles (${errCount} sin stock)`)
    } else {
      error('No se pudo agregar ningún producto al carrito')
    }
    openCartDrawer()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
            Pedido {pedido.idFactura}
          </h3>
          <p className="text-sm text-text-muted dark:text-text-muted-dark">{fecha}</p>
        </div>
        {ESTADOS_EXITOSOS.has(pedido.estado) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRepetirPedido}
            loading={isRepeating}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Repetir pedido
          </Button>
        )}
      </div>

      {/* Timeline */}
      <EstadoTimeline estado={pedido.estado} />

      {/* Items */}
      <div className="border border-border-base dark:border-border-base-dark rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-bg-hover dark:bg-bg-hover-dark border-b border-border-base dark:border-border-base-dark">
          <h4 className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
            Productos ({pedido.items.length})
          </h4>
        </div>
        <div className="divide-y divide-border-base dark:divide-border-base-dark">
          {pedido.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-4">
              <div className="w-12 h-16 rounded bg-bg-hover dark:bg-bg-hover-dark flex-shrink-0 overflow-hidden">
                {item.imagen ? (
                  <img src={item.imagen} alt={item.productoNombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted dark:text-text-muted-dark text-xs">
                    V16
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate">
                  {item.productoNombre}
                </p>
                <p className="text-xs text-text-muted dark:text-text-muted-dark">
                  {item.color} · {item.talla} · x{item.cantidad}
                </p>
              </div>
              <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark tabular-nums">
                ${item.subtotal.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-lg border border-border-base dark:border-border-base-dark space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary dark:text-text-secondary-dark">Subtotal</span>
          <span className="text-text-primary dark:text-text-primary-dark tabular-nums">${pedido.subtotal.toFixed(2)}</span>
        </div>
        {pedido.descuento > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-status-success dark:text-status-success-dark">Descuento</span>
            <span className="text-status-success dark:text-status-success-dark tabular-nums">-${pedido.descuento.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary dark:text-text-secondary-dark">Impuestos</span>
          <span className="text-text-primary dark:text-text-primary-dark tabular-nums">${pedido.impuestos.toFixed(2)}</span>
        </div>
        <div className="border-t border-border-base dark:border-border-base-dark pt-2 flex justify-between">
          <span className="font-semibold text-text-primary dark:text-text-primary-dark">Total</span>
          <span className="font-semibold text-accent tabular-nums">${pedido.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping address */}
      {pedido.direccionEnvio && (
        <div className="p-4 rounded-lg border border-border-base dark:border-border-base-dark">
          <h4 className="text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
            Dirección de envío
          </h4>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
            {pedido.direccionEnvio.callePrincipal} {pedido.direccionEnvio.numeracion}
          </p>
          <p className="text-xs text-text-muted dark:text-text-muted-dark">
            {pedido.direccionEnvio.ciudad}, {pedido.direccionEnvio.provincia}
          </p>
        </div>
      )}
    </div>
  )
}
