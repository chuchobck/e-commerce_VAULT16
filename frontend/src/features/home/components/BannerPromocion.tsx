import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/shared/components/ui/Button'

/**
 * BannerPromocion — full-width accent-colored promo banner.
 * Diagonal lines decorative pattern + bold CTA.
 */
export function BannerPromocion() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden"
    >
      {/* Background */}
      <div className="bg-accent">
        {/* Diagonal lines pattern */}
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1280 192"
          aria-hidden="true"
        >
          {Array.from({ length: 20 }, (_, i) => (
            <line
              key={i}
              x1={i * 80 - 40}
              y1="0"
              x2={i * 80 + 100}
              y2="192"
              stroke="white"
              strokeWidth="1"
              opacity="0.06"
            />
          ))}
        </svg>

        <div className="relative max-w-content mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
              DROP 001 — 15% OFF EN HOODIES
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/80">
              Hasta el 31 de mayo. Sin código.
            </p>
          </div>
          <Link to="/promociones" className="flex-shrink-0">
            <Button
              variant="secondary"
              size="lg"
              className="!bg-white !text-accent !border-white hover:!bg-white/90 font-semibold"
            >
              Ver promociones
            </Button>
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
