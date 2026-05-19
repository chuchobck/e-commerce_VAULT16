import { motion } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import type { Promocion } from '@/features/promociones/api/promocionesApi'

interface PromoGridCardProps {
  promo: Promocion
  expanded: boolean
  onToggle: () => void
}

/** Frases llamativas por nombre de promo — fallback genérico si no matchea. */
function hookFor(promo: Promocion): string {
  const n = promo.nombre.toLowerCase()
  if (n.includes('drop')) return 'Estrenamos. Vos te lo llevás.'
  if (n.includes('cargo')) return 'Bolsillos para todo. Descuento para todos.'
  if (n.includes('tee')) return 'Una semana, una tee, todos los días.'
  if (n.includes('layer') || n.includes('jacket')) return 'Capas que pesan. Precios que no.'
  if (n.includes('set') || n.includes('capsule')) return 'Outfit completo, un solo click.'
  if (n.includes('black friday')) return 'El día más oscuro del año.'
  return 'Aprovechalo antes de que se acabe.'
}

export function PromoGridCard({ promo, expanded, onToggle }: PromoGridCardProps) {
  // Hue determinístico por nombre para variar el gradiente
  const hue = promo.nombre.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  const hue2 = (hue + 60) % 360

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      id={`promo-card-${promo.id}`}
      aria-expanded={expanded}
      aria-controls={`promo-panel-${promo.id}`}
      aria-label={`${promo.nombre} — ${promo.porcentaje}% off — click para ver detalle`}
      className={`
        group relative overflow-hidden rounded-xl text-left w-full h-56
        border transition-colors
        ${expanded
          ? 'border-accent ring-2 ring-accent/30'
          : 'border-border-base dark:border-border-base-dark hover:border-accent/60'}
        bg-bg-card dark:bg-bg-card-dark
      `}
    >
      {/* Fondo SVG procedural */}
      <svg
        viewBox="0 0 400 280"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`pgc-${promo.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`hsla(${hue}, 65%, 50%, 0.20)`} />
            <stop offset="100%" stopColor={`hsla(${hue2}, 65%, 50%, 0.05)`} />
          </linearGradient>
        </defs>
        <rect width="400" height="280" fill={`url(#pgc-${promo.id})`} />
        <circle cx="350" cy="60" r="120" fill={`hsla(${hue}, 60%, 50%, 0.08)`} />
        <circle cx="50" cy="240" r="90" fill={`hsla(${hue2}, 60%, 50%, 0.07)`} />
        <text
          x="370"
          y="265"
          textAnchor="end"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="12"
          fill={`hsla(${hue}, 50%, 70%, 0.25)`}
        >
          V16 · PROMO
        </text>
      </svg>

      {/* Contenido */}
      <div className="relative h-full p-5 flex flex-col justify-between">
        {/* Top — badge descuento */}
        <div className="flex items-start justify-between gap-2">
          {(() => {
            const labels = {
              VIGENTE: 'Vigente',
              PROXIMA: 'Próxima',
              FINALIZADA: 'Finalizada',
            } as const
            const dotColor = {
              VIGENTE: 'text-accent',
              PROXIMA: 'text-amber-400',
              FINALIZADA: 'text-text-muted dark:text-text-muted-dark',
            } as const
            return (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-surface/80 dark:bg-bg-surface-dark/80 backdrop-blur border border-border-base/50 dark:border-border-base-dark/50">
                <Sparkles className={`h-3.5 w-3.5 ${dotColor[promo.estado]}`} />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">
                  {labels[promo.estado]}
                </span>
              </div>
            )
          })()}
          <div className="px-3 py-1 rounded-md bg-accent text-white shadow-md">
            <span className="text-lg font-bold tabular-nums">-{promo.porcentaje}%</span>
          </div>
        </div>

        {/* Bottom — título + hook + chevron */}
        <div>
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-1 line-clamp-1">
            {promo.nombre}
          </h3>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark line-clamp-2 mb-3">
            {hookFor(promo)}
          </p>
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-accent group-hover:underline">
              {expanded ? 'Ocultar detalle' : 'Ver detalle'}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-accent transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>
    </motion.button>
  )
}
