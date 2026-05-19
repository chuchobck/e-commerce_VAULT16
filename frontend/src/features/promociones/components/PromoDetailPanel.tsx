import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowRight, Calendar, Package, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { Promocion } from '@/features/promociones/api/promocionesApi'

interface PromoDetailPanelProps {
  promo: Promocion
  onClose: () => void
}

function ProductThumb({ foto, nombre }: { foto?: string; nombre: string }) {
  const hue = nombre.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  if (foto) {
    return <img src={foto} alt={nombre} className="w-full h-full object-cover" loading="lazy" />
  }
  return (
    <svg viewBox="0 0 48 60" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="48" height="60" fill="#1E2428" />
      <circle cx="24" cy="30" r="14" fill={`hsla(${hue}, 50%, 50%, 0.15)`} />
    </svg>
  )
}

export const PromoDetailPanel = forwardRef<HTMLDivElement, PromoDetailPanelProps>(
  function PromoDetailPanel({ promo, onClose }, ref) {
    const inicio = format(new Date(promo.fechaInicio), "d 'de' MMM", { locale: es })
    const fin = format(new Date(promo.fechaFin), "d 'de' MMM yyyy", { locale: es })

    return (
      <motion.div
        ref={ref}
        id={`promo-panel-${promo.id}`}
        role="region"
        aria-labelledby={`promo-card-${promo.id}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl border border-accent/40 bg-bg-card dark:bg-bg-card-dark p-5 sm:p-6 shadow-card dark:shadow-card-dark"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-bold bg-accent text-white rounded">
                -{promo.porcentaje}% OFF
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-text-muted dark:text-text-muted-dark">
                <Calendar className="h-3 w-3" />
                {inicio} — {fin}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-text-muted dark:text-text-muted-dark">
                <Package className="h-3 w-3" />
                {promo.productos.length} producto{promo.productos.length === 1 ? '' : 's'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-text-primary dark:text-text-primary-dark">
              {promo.nombre}
            </h3>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1 max-w-2xl">
              {promo.descripcion}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-md text-text-muted hover:text-text-primary dark:text-text-muted-dark dark:hover:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors"
            aria-label="Cerrar detalle"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grilla de productos incluidos */}
        {promo.productos.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-mono uppercase tracking-wider text-text-muted dark:text-text-muted-dark mb-3">
              Productos incluidos
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {promo.productos.map((p) => {
                const mainFoto = p.fotos.find((f) => f.esPrincipal) || p.fotos[0]
                return (
                  <Link
                    key={p.id}
                    to={`/producto/${p.id}`}
                    className="group rounded-md border border-border-base dark:border-border-base-dark overflow-hidden hover:border-accent transition-colors"
                  >
                    <div className="aspect-product bg-bg-hover dark:bg-bg-hover-dark overflow-hidden">
                      <ProductThumb foto={mainFoto?.url} nombre={p.nombre} />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-text-primary dark:text-text-primary-dark truncate group-hover:text-accent transition-colors">
                        {p.nombre}
                      </p>
                      <p className="text-xs text-text-muted dark:text-text-muted-dark tabular-nums">
                        ${p.precio.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-5 flex justify-end">
          <Link to={`/catalogo?promo=${promo.id}`}>
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Ir al catálogo
            </Button>
          </Link>
        </div>
      </motion.div>
    )
  },
)
