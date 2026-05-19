import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useUIStore } from '@/shared/stores/uiStore'

/**
 * Toggle Dark/Light mode.
 * - Lee/setea uiStore.isDark
 * - Animación spring 200ms al cambiar
 */
export function ThemeToggle() {
  const isDark = useUIStore((s) => s.isDark)
  const toggleDark = useUIStore((s) => s.toggleDark)

  return (
    <button
      type="button"
      onClick={toggleDark}
      className="relative p-2 rounded-md text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors duration-fast"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ scale: 0, rotate: -90, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, rotate: 90, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.2 }}
      >
        {isDark ? (
          <Moon className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Sun className="h-5 w-5" aria-hidden="true" />
        )}
      </motion.div>
    </button>
  )
}
