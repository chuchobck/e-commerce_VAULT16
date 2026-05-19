import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPedidos } from '@/features/pedidos/api/pedidosApi'
import { PedidoCard } from '@/features/pedidos/components/PedidoCard'
import { Button } from '@/shared/components/ui/Button'

export function PedidosPage() {
  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos'],
    queryFn: getPedidos,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="animate-pulse h-20 rounded-lg bg-bg-hover dark:bg-bg-hover-dark" />
        ))}
      </div>
    )
  }

  if (pedidos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Package className="h-12 w-12 text-text-muted dark:text-text-muted-dark mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-1">
          Sin pedidos todavía
        </h3>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
          Cuando hagas tu primera compra, aparecerá acá.
        </p>
        <Link to="/catalogo">
          <Button variant="primary" size="md">
            Ir al catálogo
          </Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-1">
        Mis pedidos
      </h2>
      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
        Historial de compras
      </p>
      <div className="space-y-3">
        {pedidos.map((p) => (
          <PedidoCard key={p.id} pedido={p} />
        ))}
      </div>
    </div>
  )
}
