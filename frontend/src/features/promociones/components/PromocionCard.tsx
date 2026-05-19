import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Tag } from 'lucide-react'
import type { Promocion } from '@/features/promociones/api/promocionesApi'

interface PromocionCardProps {
  promo: Promocion
}

function ProductThumb({ foto, nombre }: { foto?: string; nombre: string }) {
  const hue = nombre.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  if (foto) {
    return <img src={foto} alt={nombre} className="w-full h-full object-cover" />
  }
  return (
    <svg viewBox="0 0 48 60" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="48" height="60" fill="#1E2428" />
      <circle cx="24" cy="30" r="12" fill={`hsla(${hue}, 50%, 50%, 0.12)`} />
    </svg>
  )
}

export function PromocionCard({ promo }: PromocionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const maxPreview = 3
  const remainingCount = Math.max(0, promo.productos.length - maxPreview)

  return (
    <div className="rounded-lg border border-border-base dark:border-border-base-dark bg-bg-card dark:bg-bg-card-dark overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Tag className="h-5 w-5 text-accent flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate">
                {promo.nombre}
              </span>
              <span className="px-1.5 py-0.5 text-xs font-semibold bg-accent/10 text-accent rounded flex-shrink-0">
                -{promo.porcentaje}%
              </span>
            </div>
            <p className="text-xs text-text-muted dark:text-text-muted-dark truncate mt-0.5">
              {promo.descripcion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Mini thumbnails */}
          <div className="hidden sm:flex -space-x-2">
            {promo.productos.slice(0, maxPreview).map((p) => {
              const mainFoto = p.fotos.find((f) => f.esPrincipal) || p.fotos[0]
              return (
                <div key={p.id} className="w-8 h-10 rounded border border-bg-surface dark:border-bg-surface-dark overflow-hidden">
                  <ProductThumb foto={mainFoto?.url} nombre={p.nombre} />
                </div>
              )
            })}
            {remainingCount > 0 && (
              <div className="w-8 h-10 rounded bg-bg-hover dark:bg-bg-hover-dark border border-bg-surface dark:border-bg-surface-dark flex items-center justify-center">
                <span className="text-[10px] font-medium text-text-muted dark:text-text-muted-dark">+{remainingCount}</span>
              </div>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-text-muted dark:text-text-muted-dark transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {promo.productos.map((p) => {
                const mainFoto = p.fotos.find((f) => f.esPrincipal) || p.fotos[0]
                return (
                  <Link
                    key={p.id}
                    to={`/producto/${p.id}`}
                    className="group rounded-md border border-border-base dark:border-border-base-dark overflow-hidden hover:border-accent/40 transition-colors"
                  >
                    <div className="aspect-product bg-bg-hover dark:bg-bg-hover-dark overflow-hidden">
                      <ProductThumb foto={mainFoto?.url} nombre={p.nombre} />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-text-primary dark:text-text-primary-dark truncate group-hover:text-accent transition-colors">
                        {p.nombre}
                      </p>
                      <p className="text-xs text-text-muted dark:text-text-muted-dark tabular-nums">${p.precio.toFixed(2)}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
