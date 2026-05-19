import { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Producto } from '@/shared/types/producto.types'

// ─── Procedural SVG Placeholder (seeded by product id) ───────────────────────

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function ProductPlaceholderSVG({ seed: rawSeed }: { seed: string | number }) {
  const seed = typeof rawSeed === 'number' ? rawSeed : hashSeed(rawSeed)
  // Simple hash to get varied visuals per product
  const hue = (seed * 137) % 360
  const angle = (seed * 53) % 180
  const shapes = (seed % 4) + 2

  return (
    <svg viewBox="0 0 300 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`pg-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E2428" />
          <stop offset="100%" stopColor="#252A2E" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill={`url(#pg-${seed})`} />
      {Array.from({ length: shapes }, (_, i) => {
        const cx = 80 + ((seed + i * 97) % 140)
        const cy = 100 + ((seed + i * 73) % 200)
        const r = 20 + ((seed + i * 37) % 40)
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={`hsla(${(hue + i * 30) % 360}, 60%, 55%, 0.08)`}
            stroke={`hsla(${(hue + i * 30) % 360}, 60%, 55%, 0.12)`}
            strokeWidth="1"
          />
        )
      })}
      <line
        x1="0"
        y1={400 - angle}
        x2="300"
        y2={angle}
        stroke="#3B82F6"
        strokeWidth="1"
        opacity="0.1"
      />
      <text
        x="150"
        y="380"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="14"
        fill="#4A535A"
      >
        VAULT 16
      </text>
    </svg>
  )
}

// ─── Product Image ───────────────────────────────────────────────────────────

function ProductImage({ producto }: { producto: Producto }) {
  const mainFoto = producto.fotos.find((f) => f.esPrincipal) || producto.fotos[0]

  if (mainFoto) {
    return (
      <img
        src={mainFoto.url}
        alt={producto.nombre}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-normal ease-smooth group-hover:scale-105"
      />
    )
  }

  return <ProductPlaceholderSVG seed={producto.id} />
}

// ─── Color Dots ──────────────────────────────────────────────────────────────

function ColorDots({ variantes }: { variantes: Producto['variantes'] }) {
  const uniqueColors = useMemo(() => {
    const seen = new Set<string>()
    return variantes
      .filter((v) => {
        if (seen.has(v.color)) return false
        seen.add(v.color)
        return true
      })
      .slice(0, 5)
  }, [variantes])

  if (uniqueColors.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 mt-1">
      {uniqueColors.map((v) => (
        <span
          key={v.id}
          className="w-3 h-3 rounded-full border border-border-base dark:border-border-base-dark"
          style={{ backgroundColor: v.codigoHex || '#4A535A' }}
          title={v.color}
          aria-label={`Color ${v.color}`}
        />
      ))}
    </div>
  )
}

// ─── ProductCard ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  producto: Producto
}

export const ProductCard = memo(function ProductCard({ producto }: ProductCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/producto/${producto.id}`)
  }

  const precioFormateado = `$${producto.precio.toFixed(2)}`
  const descuento = producto.porcentajeDescuentoActivo

  return (
    <article
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      role="link"
      tabIndex={0}
      className="group cursor-pointer"
      aria-label={`${producto.nombre} — ${precioFormateado}`}
    >
      {/* Image container */}
      <div className="relative aspect-product overflow-hidden rounded-md bg-bg-hover dark:bg-bg-hover-dark border border-transparent group-hover:border-accent transition-colors duration-fast">
        <ProductImage producto={producto} />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-normal flex items-center justify-center">
          <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-normal translate-y-2 group-hover:translate-y-0">
            Ver detalles
          </span>
        </div>

        {/* Promo badge */}
        {descuento && descuento > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold bg-accent text-white rounded-sm">
            -{descuento}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-0.5">
        <h3 className="text-sm font-medium text-text-primary dark:text-text-primary-dark line-clamp-1">
          {producto.nombre}
        </h3>
        <p className="text-xs font-mono uppercase text-text-muted dark:text-text-muted-dark tracking-wider">
          {producto.categoria.nombre}
        </p>
        <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
          {precioFormateado}
        </p>
        <ColorDots variantes={producto.variantes} />
      </div>
    </article>
  )
})
