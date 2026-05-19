import type { EstadoPedido } from '@/features/pedidos/api/pedidosApi'
import { cn } from '@/shared/utils/cn'

const steps: { key: EstadoPedido; label: string }[] = [
  { key: 'EMI', label: 'Emitido' },
  { key: 'PAG', label: 'Pagado' },
  { key: 'ENV', label: 'Enviado' },
  { key: 'ENT', label: 'Entregado' },
]

interface EstadoTimelineProps {
  estado: EstadoPedido
}

export function EstadoTimeline({ estado }: EstadoTimelineProps) {
  if (estado === 'CAN') {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="w-3 h-3 rounded-full bg-status-danger dark:bg-status-danger-dark" />
        <span className="text-sm font-medium text-status-danger dark:text-status-danger-dark">
          Pedido cancelado
        </span>
      </div>
    )
  }

  const currentIdx = steps.findIndex((s) => s.key === estado)

  return (
    <div className="flex items-center gap-0 w-full py-4">
      {steps.map((step, i) => {
        const isCompleted = i <= currentIdx
        const isCurrent = i === currentIdx
        const isLast = i === steps.length - 1

        return (
          <div key={step.key} className={cn('flex items-center', !isLast && 'flex-1')}>
            {/* Dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-3.5 h-3.5 rounded-full border-2 transition-colors',
                  isCompleted
                    ? 'bg-accent border-accent'
                    : 'bg-transparent border-border-base dark:border-border-base-dark',
                  isCurrent && 'ring-4 ring-accent/20',
                )}
              />
              <span
                className={cn(
                  'text-[10px] mt-1.5 font-medium whitespace-nowrap',
                  isCompleted
                    ? 'text-accent'
                    : 'text-text-muted dark:text-text-muted-dark',
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Line */}
            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-1',
                  i < currentIdx
                    ? 'bg-accent'
                    : 'bg-border-base dark:bg-border-base-dark',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
