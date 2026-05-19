import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { PedidoResumen, EstadoPedido } from '@/features/pedidos/api/pedidosApi'

const estadoConfig: Record<EstadoPedido, { label: string; color: string }> = {
  EMI: { label: 'Emitido',    color: 'bg-accent/10 text-accent' },
  PAG: { label: 'Pagado',     color: 'bg-status-success-bg dark:bg-status-success-bg-dark text-status-success dark:text-status-success-dark' },
  ENV: { label: 'Enviado',    color: 'bg-status-warning-bg dark:bg-status-warning-bg-dark text-status-warning dark:text-status-warning-dark' },
  ENT: { label: 'Entregado',  color: 'bg-status-success-bg dark:bg-status-success-bg-dark text-status-success dark:text-status-success-dark' },
  CAN: { label: 'Cancelado',  color: 'bg-status-danger-bg dark:bg-status-danger-bg-dark text-status-danger dark:text-status-danger-dark' },
}

interface PedidoCardProps {
  pedido: PedidoResumen
}

export function PedidoCard({ pedido }: PedidoCardProps) {
  const cfg = estadoConfig[pedido.estado]
  const fecha = format(new Date(pedido.fecha), "d 'de' MMM yyyy", { locale: es })

  return (
    <Link
      to={`/mi-cuenta/pedidos/${pedido.id}`}
      className="block p-4 rounded-lg border border-border-base dark:border-border-base-dark bg-bg-card dark:bg-bg-card-dark hover:border-accent/40 transition-colors group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-accent" aria-hidden="true" />
          <span className="text-sm font-mono font-medium text-text-primary dark:text-text-primary-dark">
            {pedido.idFactura}
          </span>
        </div>
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted dark:text-text-muted-dark">{fecha}</p>
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
            {pedido.totalItems} {pedido.totalItems === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary dark:text-text-primary-dark tabular-nums">
            ${pedido.total.toFixed(2)}
          </span>
          <ChevronRight className="h-4 w-4 text-text-muted dark:text-text-muted-dark group-hover:text-accent transition-colors" />
        </div>
      </div>
    </Link>
  )
}
