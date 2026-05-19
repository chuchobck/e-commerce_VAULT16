import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag } from 'lucide-react'
import { getPromociones } from '@/features/promociones/api/promocionesApi'
import { PromoGridCard } from '@/features/promociones/components/PromoGridCard'
import { PromoDetailPanel } from '@/features/promociones/components/PromoDetailPanel'

/**
 * Página de promociones.
 *
 * Layout:
 *   - Título arriba.
 *   - Grilla 3×2 de cards (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop).
 *   - Al hacer click en una card, se expande UN solo panel debajo de la grilla
 *     con el detalle (descripción completa, productos incluidos, CTA al catálogo).
 *   - Click en la misma card lo cierra. Click en otra reemplaza el panel y
 *     hace scroll suave hasta él.
 */
export function PromocionesPage() {
  const { data: promos = [], isLoading } = useQuery({
    queryKey: ['promociones'],
    queryFn: getPromociones,
  })

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Scroll suave hacia el panel cuando se abre/cambia
  useEffect(() => {
    if (expandedId !== null && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [expandedId])

  const handleToggle = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  if (isLoading) {
    return (
      <div className="max-w-content mx-auto px-4 sm:px-6 py-8">
        <div className="h-8 w-48 bg-bg-hover dark:bg-bg-hover-dark rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="animate-pulse h-56 rounded-xl bg-bg-hover dark:bg-bg-hover-dark" />
          ))}
        </div>
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

  const expandedPromo = promos.find((p) => p.id === expandedId) ?? null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-content mx-auto px-4 sm:px-6 py-8"
    >
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary dark:text-text-primary-dark">
          Promociones
        </h1>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
          Tocá una promo para ver los productos incluidos y la vigencia.
        </p>
      </div>

      {/* Grilla 3x2 (responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((p) => (
          <PromoGridCard
            key={p.id}
            promo={p}
            expanded={expandedId === p.id}
            onToggle={() => handleToggle(p.id)}
          />
        ))}
      </div>

      {/* Panel de detalle debajo de la grilla */}
      <AnimatePresence mode="wait">
        {expandedPromo && (
          <div className="mt-6" key={expandedPromo.id}>
            <PromoDetailPanel
              ref={panelRef}
              promo={expandedPromo}
              onClose={() => setExpandedId(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
