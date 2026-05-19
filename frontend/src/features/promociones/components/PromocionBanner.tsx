import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { Promocion } from '@/features/promociones/api/promocionesApi'

interface PromocionBannerProps {
  promo: Promocion
}

export function PromocionBanner({ promo }: PromocionBannerProps) {
  const inicio = format(new Date(promo.fechaInicio), "d 'de' MMM", { locale: es })
  const fin = format(new Date(promo.fechaFin), "d 'de' MMM yyyy", { locale: es })

  // Procedural SVG based on promo name
  const hue = promo.nombre.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-base dark:border-border-base-dark bg-bg-card dark:bg-bg-card-dark">
      {/* SVG background art */}
      <svg
        viewBox="0 0 800 200"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`promo-grad-${promo.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`hsla(${hue}, 60%, 50%, 0.08)`} />
            <stop offset="100%" stopColor={`hsla(${(hue + 60) % 360}, 60%, 50%, 0.04)`} />
          </linearGradient>
        </defs>
        <rect width="800" height="200" fill={`url(#promo-grad-${promo.id})`} />
        <circle cx="700" cy="100" r="120" fill={`hsla(${hue}, 50%, 50%, 0.06)`} />
        <circle cx="100" cy="150" r="80" fill={`hsla(${(hue + 120) % 360}, 50%, 50%, 0.05)`} />
        <text x="650" y="180" fontFamily="'JetBrains Mono', monospace" fontSize="14" fill={`hsla(${hue}, 50%, 60%, 0.15)`}>
          V16
        </text>
      </svg>

      <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-accent/10 text-accent rounded">
              -{promo.porcentaje}%
            </span>
            <span className="text-xs text-text-muted dark:text-text-muted-dark">
              {inicio} – {fin}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary dark:text-text-primary-dark mb-1">
            {promo.nombre}
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark max-w-lg">
            {promo.descripcion}
          </p>
        </div>
        <Link to={`/catalogo?promo=${promo.id}`}>
          <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Ver productos
          </Button>
        </Link>
      </div>
    </div>
  )
}
