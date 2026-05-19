import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'

interface CarritoVacioProps {
  onClose: () => void
}

/**
 * Empty cart illustration + CTA to browse catalog.
 */
export function CarritoVacio({ onClose }: CarritoVacioProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      {/* Empty cart SVG illustration */}
      <svg
        viewBox="0 0 200 200"
        className="w-32 h-32 mb-6 text-text-muted dark:text-text-muted-dark"
        aria-hidden="true"
      >
        {/* Cart body */}
        <rect
          x="40" y="70" width="120" height="80" rx="8"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeDasharray="6 4" opacity="0.5"
        />
        {/* Cart handle */}
        <path
          d="M65 70 L65 45 Q65 35 75 35 L125 35 Q135 35 135 45 L135 70"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeDasharray="6 4" opacity="0.5"
        />
        {/* Wheels */}
        <circle cx="70" cy="160" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
        <circle cx="130" cy="160" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
        {/* Wind lines */}
        <line x1="85" y1="95" x2="115" y2="95" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
        <line x1="90" y1="110" x2="110" y2="110" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
        <line x1="88" y1="125" x2="112" y2="125" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      </svg>

      <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-1">
        Tu carrito está vacío
      </h3>
      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
        Empezá a explorar el catálogo y encontrá tu estilo.
      </p>
      <Link to="/catalogo" onClick={onClose}>
        <Button
          variant="primary"
          size="md"
          leftIcon={<ShoppingBag className="h-4 w-4" />}
        >
          Ver catálogo
        </Button>
      </Link>
    </motion.div>
  )
}
