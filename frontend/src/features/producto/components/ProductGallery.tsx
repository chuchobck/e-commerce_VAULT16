import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'
import type { Foto } from '@/shared/types/producto.types'

// ─── Procedural SVG placeholder (same as catalog) ────────────────────────────

function PlaceholderSVG({ seed: rawSeed }: { seed: string | number }) {
  const seed =
    typeof rawSeed === 'number'
      ? rawSeed
      : (() => {
          let h = 0
          for (let i = 0; i < rawSeed.length; i++) h = (h * 31 + rawSeed.charCodeAt(i)) >>> 0
          return h
        })()
  const hue = (seed * 137) % 360
  const shapes = (seed % 4) + 2
  return (
    <svg viewBox="0 0 300 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`gal-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E2428" />
          <stop offset="100%" stopColor="#252A2E" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill={`url(#gal-${seed})`} />
      {Array.from({ length: shapes }, (_, i) => (
        <circle
          key={i}
          cx={80 + ((seed + i * 97) % 140)}
          cy={100 + ((seed + i * 73) % 200)}
          r={20 + ((seed + i * 37) % 40)}
          fill={`hsla(${(hue + i * 30) % 360}, 60%, 55%, 0.08)`}
          stroke={`hsla(${(hue + i * 30) % 360}, 60%, 55%, 0.12)`}
          strokeWidth="1"
        />
      ))}
      <text x="150" y="380" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="14" fill="#4A535A">
        VAULT 16
      </text>
    </svg>
  )
}

// ─── Lightbox Modal ──────────────────────────────────────────────────────────

function Lightbox({
  url,
  alt,
  onClose,
}: {
  url: string
  alt: string
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-modal bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-label="Zoom de imagen"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Cerrar zoom"
      >
        <X className="h-6 w-6" />
      </button>
      <motion.img
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        src={url}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  )
}

// ─── ProductGallery ──────────────────────────────────────────────────────────

interface ProductGalleryProps {
  fotos: Foto[]
  productId: string
  productName: string
}

export function ProductGallery({ fotos, productId, productName }: ProductGalleryProps) {
  const sorted = useMemo(
    () =>
      [...fotos].sort((a, b) => {
        if (a.esPrincipal && !b.esPrincipal) return -1
        if (!a.esPrincipal && b.esPrincipal) return 1
        return a.orden - b.orden
      }),
    [fotos],
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const current = sorted[selectedIndex]

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && selectedIndex > 0) setSelectedIndex((i) => i - 1)
      if (e.key === 'ArrowRight' && selectedIndex < sorted.length - 1) setSelectedIndex((i) => i + 1)
    },
    [selectedIndex, sorted.length],
  )

  // No photos — placeholder
  if (sorted.length === 0) {
    return (
      <div className="aspect-product rounded-lg overflow-hidden bg-bg-hover dark:bg-bg-hover-dark">
        <PlaceholderSVG seed={productId} />
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3" onKeyDown={handleKeyDown} tabIndex={0} role="region" aria-label="Galería de imágenes">
      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] scrollbar-hide">
          {sorted.map((foto, i) => (
            <button
              key={foto.id}
              onClick={() => setSelectedIndex(i)}
              className={`
                flex-shrink-0 w-16 h-20 sm:w-16 sm:h-20 rounded-md overflow-hidden border-2 transition-colors
                ${i === selectedIndex ? 'border-accent' : 'border-transparent hover:border-border-strong dark:hover:border-border-strong-dark'}
              `}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === selectedIndex ? 'true' : undefined}
            >
              <img
                src={foto.url}
                alt={`${productName} — miniatura ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="aspect-product rounded-lg overflow-hidden bg-bg-hover dark:bg-bg-hover-dark cursor-zoom-in group relative"
            onClick={() => setLightboxOpen(true)}
            role="button"
            aria-label="Click para ampliar imagen"
          >
            <img
              src={current.url}
              alt={`${productName} — foto principal`}
              className="w-full h-full object-cover"
            />
            {/* Zoom overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-70 transition-opacity" aria-hidden="true" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && current && (
          <Lightbox
            url={current.url}
            alt={productName}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
