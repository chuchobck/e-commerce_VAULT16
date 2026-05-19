import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'

// ─── Slide data ──────────────────────────────────────────────────────────────

const slides = [
  {
    id: 1,
    titulo: 'DROP 001',
    subtitulo: 'Primera entrega. Hoodies y tees con descuento.',
    cta: 'Ver drop',
    href: '/promociones',
  },
  {
    id: 2,
    titulo: 'STREETWEAR URBANO',
    subtitulo: 'Diseñado para la calle. Hecho en Quito.',
    cta: 'Explorar',
    href: '/catalogo',
  },
  {
    id: 3,
    titulo: 'NUEVA TEMPORADA',
    subtitulo: 'Pesos heavy, fits oversize, paleta sobria.',
    cta: 'Ver catálogo',
    href: '/catalogo',
  },
] as const

// ─── Procedural SVG Art (one per slide mood) ─────────────────────────────────

function SlideArt1() {
  return (
    <svg viewBox="0 0 1280 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="hero-grad-1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#181C1F" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect width="1280" height="500" fill="url(#hero-grad-1)" />
      {/* Diagonal aggressive lines */}
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1={i * 120 - 100}
          y1="0"
          x2={i * 120 + 200}
          y2="500"
          stroke="#3B82F6"
          strokeWidth={i % 3 === 0 ? 3 : 1}
          opacity={0.15 + (i % 4) * 0.05}
        />
      ))}
      {/* Angular shapes */}
      <polygon points="800,50 950,200 700,200" fill="#60A5FA" opacity="0.08" />
      <polygon points="900,100 1100,300 750,350" fill="#3B82F6" opacity="0.06" />
      <polygon points="1050,0 1280,180 1280,0" fill="#2563EB" opacity="0.1" />
      {/* Giant decorative text */}
      <text
        x="850"
        y="420"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="180"
        fontWeight="700"
        fill="#60A5FA"
        opacity="0.06"
        textAnchor="middle"
      >
        DROP/001
      </text>
    </svg>
  )
}

function SlideArt2() {
  return (
    <svg viewBox="0 0 1280 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="hero-grad-2" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#0E1114" />
          <stop offset="100%" stopColor="#1D3A6B" />
        </linearGradient>
        <radialGradient id="glow-2" cx="70%" cy="50%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1280" height="500" fill="url(#hero-grad-2)" />
      <rect width="1280" height="500" fill="url(#glow-2)" />
      {/* Concentric circles — spatial vibe */}
      {Array.from({ length: 8 }, (_, i) => (
        <circle
          key={i}
          cx="900"
          cy="250"
          r={60 + i * 50}
          fill="none"
          stroke="#60A5FA"
          strokeWidth={i === 0 ? 2 : 1}
          opacity={0.12 - i * 0.01}
        />
      ))}
      {/* Orbital dots */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i * 60 * Math.PI) / 180
        const r = 180
        return (
          <circle
            key={`dot-${i}`}
            cx={900 + r * Math.cos(angle)}
            cy={250 + r * Math.sin(angle)}
            r="4"
            fill="#3B82F6"
            opacity="0.3"
          />
        )
      })}
      {/* Decorative text */}
      <text
        x="900"
        y="300"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="140"
        fontWeight="700"
        fill="#60A5FA"
        opacity="0.05"
        textAnchor="middle"
      >
        VAULT·16
      </text>
    </svg>
  )
}

function SlideArt3() {
  return (
    <svg viewBox="0 0 1280 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="hero-grad-3" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor="#181C1F" />
          <stop offset="100%" stopColor="#252A2E" />
        </linearGradient>
        <pattern id="noise" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" x="0" y="0" fill="#60A5FA" opacity="0.15" />
          <rect width="1" height="1" x="2" y="2" fill="#60A5FA" opacity="0.1" />
          <rect width="1" height="1" x="3" y="1" fill="#3B82F6" opacity="0.08" />
        </pattern>
      </defs>
      <rect width="1280" height="500" fill="url(#hero-grad-3)" />
      <rect width="1280" height="500" fill="url(#noise)" />
      {/* Static/glitch horizontal lines */}
      {Array.from({ length: 20 }, (_, i) => (
        <rect
          key={i}
          x={400 + (i % 5) * 80}
          y={i * 25}
          width={100 + (i % 3) * 60}
          height="1"
          fill="#60A5FA"
          opacity={0.1 + (i % 4) * 0.03}
        />
      ))}
      {/* Signal bars */}
      {Array.from({ length: 5 }, (_, i) => (
        <rect
          key={`bar-${i}`}
          x={950 + i * 18}
          y={350 - i * 20}
          width="10"
          height={20 + i * 20}
          fill="#3B82F6"
          opacity="0.12"
          rx="2"
        />
      ))}
      {/* Decorative text */}
      <text
        x="850"
        y="400"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="160"
        fontWeight="700"
        fill="#60A5FA"
        opacity="0.04"
        textAnchor="middle"
      >
        ESTÁTICA
      </text>
    </svg>
  )
}

const slideArts = [SlideArt1, SlideArt2, SlideArt3]

// ─── HeroBanner Component ────────────────────────────────────────────────────

export function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length)
  }, [])

  // Auto-advance each 6 seconds, pause on hover
  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [paused, next])

  const slide = slides[current]
  const ArtComponent = slideArts[current]

  return (
    <section
      className="relative w-full h-[360px] sm:h-[420px] lg:h-[500px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Carrusel principal"
      role="region"
    >
      {/* Slide background art */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <ArtComponent />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* Text content (bottom-left) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`text-${slide.id}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="absolute bottom-12 left-6 sm:left-12 lg:left-16 max-w-lg z-raised"
        >
          <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-accent mb-2">
            VAULT 16
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-3">
            {slide.titulo}
          </h2>
          <p className="text-sm sm:text-base text-asphalt-200 mb-6 max-w-md">
            {slide.subtitulo}
          </p>
          <Link to={slide.href}>
            <Button variant="primary" size="lg">
              {slide.cta}
            </Button>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows (show on hover) */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-raised p-2 rounded-full bg-black/30 text-white/70 hover:bg-black/50 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-fast hidden sm:flex items-center justify-center hover:opacity-100 focus-visible:opacity-100"
        style={{ opacity: undefined }}
        aria-label="Slide anterior"
        onFocus={() => setPaused(true)}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-raised p-2 rounded-full bg-black/30 text-white/70 hover:bg-black/50 hover:text-white transition-all duration-fast hidden sm:flex items-center justify-center"
        aria-label="Slide siguiente"
        onFocus={() => setPaused(true)}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-raised">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            className={`
              h-2 rounded-full transition-all duration-normal
              ${i === current ? 'w-8 bg-accent' : 'w-2 bg-white/40 hover:bg-white/60'}
            `}
            aria-label={`Ir al slide ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
          />
        ))}
      </div>
    </section>
  )
}
