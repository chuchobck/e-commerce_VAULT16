import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { getPedido } from '@/features/pedidos/api/pedidosApi'
import { PedidoDetalle } from '@/features/pedidos/components/PedidoDetalle'

export function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id) || 0

  const { data: pedido, isLoading, isError } = useQuery({
    queryKey: ['pedido', numericId],
    queryFn: () => getPedido(numericId),
    enabled: numericId > 0,
  })

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-bg-hover dark:bg-bg-hover-dark rounded" />
        <div className="h-16 bg-bg-hover dark:bg-bg-hover-dark rounded-lg" />
        <div className="h-48 bg-bg-hover dark:bg-bg-hover-dark rounded-lg" />
      </div>
    )
  }

  if (isError || !pedido) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary dark:text-text-secondary-dark mb-4">
          Pedido no encontrado
        </p>
        <Link to="/mi-cuenta/pedidos" className="text-accent hover:underline text-sm">
          ← Volver a mis pedidos
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/mi-cuenta/pedidos"
        className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis pedidos
      </Link>
      <PedidoDetalle pedido={pedido} />
    </div>
  )
}
