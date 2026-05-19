import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Tag } from 'lucide-react'
import { getPromociones } from '@/features/promociones/api/promocionesApi'
import { PromocionBanner } from '@/features/promociones/components/PromocionBanner'
import { PromocionCard } from '@/features/promociones/components/PromocionCard'

export function PromocionesPage() {
  const { data: promos = [], isLoading } = useQuery({
    queryKey: ['promociones'],
    queryFn: getPromociones,
  })

  if (isLoading) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6 py-8 space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="animate-pulse h-32 rounded-xl bg-bg-hover dark:bg-bg-hover-dark" />
        ))}
      </div>
    )
  }

  if (promos.length === 0) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6 py-20 text-center">
        <Tag className="h-12 w-12 text-text-muted dark:text-text-muted-dark mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          Sin promociones activas
        </h2>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
          Seguí de cerca nuestras redes para enterarte de los próximos drops.
        </p>
      </div>
    )
  }

  const [featured, ...rest] = promos

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-content mx-auto px-4 sm:px-6 py-8"
    >
      <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary dark:text-text-primary-dark mb-6">
        Promociones
      </h1>

      {/* Featured promo */}
      {featured && <PromocionBanner promo={featured} />}

      {/* Other promos */}
      {rest.length > 0 && (
        <div className="mt-6 space-y-3">
          {rest.map((p) => (
            <PromocionCard key={p.id} promo={p} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
