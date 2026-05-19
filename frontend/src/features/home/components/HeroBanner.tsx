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
    img: 'https://i.pinimg.com/originals/96/30/01/963001c759fd8152b7a7fca86e1be36e.jpg',
    imgAlt: 'Modelo con hoodie oscuro en entorno urbano',
  },
  {
    id: 2,
    titulo: 'STREETWEAR URBANO',
    subtitulo: 'Diseñado para la calle. Hecho en Quito.',
    cta: 'Explorar',
    href: '/catalogo',
    img: 'https://i.pinimg.com/originals/39/aa/fd/39aafddd87f1f59321e465af7db5c0db.jpg',
    imgAlt: 'Look streetwear urbano completo',
  },
  {
    id: 3,
    titulo: 'NUEVA TEMPORADA',
    subtitulo: 'Pesos heavy, fits oversize, paleta sobria.',
    cta: 'Ver catálogo',
    href: '/catalogo',
    img: 'https://rawlooks.com/app/uploads/2020/12/avant-garde-dark-fashion-editorial-by-tim-koeck-boris-bidjan-saberi-army-of-me-hannes-roether-dita-eyewear-29-1600x1067.jpg',
    imgAlt: 'Outfit oversize temporada oscura editorial',
  },
] as const

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

  return (
    <section
      className="relative w-full h-[360px] sm:h-[420px] lg:h-[500px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Carrusel principal"
      role="region"
    >
      {/* Slide background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={slide.img}
            alt={slide.imgAlt}
            className="w-full h-full object-cover object-center"
            loading={current === 0 ? 'eager' : 'lazy'}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

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

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-raised p-2 rounded-full bg-black/30 text-white/70 hover:bg-black/60 hover:text-white transition-all duration-fast hidden sm:flex items-center justify-center"
        aria-label="Slide anterior"
        onFocus={() => setPaused(true)}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-raised p-2 rounded-full bg-black/30 text-white/70 hover:bg-black/60 hover:text-white transition-all duration-fast hidden sm:flex items-center justify-center"
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
