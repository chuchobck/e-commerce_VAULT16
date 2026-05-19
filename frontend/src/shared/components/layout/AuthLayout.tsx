import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

/**
 * AuthLayout — Centered card layout for auth pages.
 * No Header/Footer. Logo + SVG art background.
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg-base dark:bg-bg-base-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background art */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg
          viewBox="0 0 1200 800"
          className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] opacity-[0.03] dark:opacity-[0.06]"
          fill="none"
        >
          <circle cx="200" cy="200" r="300" stroke="currentColor" strokeWidth="1" className="text-accent" />
          <circle cx="1000" cy="600" r="250" stroke="currentColor" strokeWidth="1" className="text-accent" />
          <line x1="0" y1="400" x2="1200" y2="400" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
          <line x1="600" y1="0" x2="600" y2="800" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
          {Array.from({ length: 6 }, (_, i) => (
            <rect
              key={i}
              x={100 + i * 180}
              y={300 + (i % 2) * 100}
              width="40"
              height="40"
              transform={`rotate(${i * 15} ${120 + i * 180} ${320 + (i % 2) * 100})`}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-accent"
            />
          ))}
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-modal"
      >
        {/* Logo */}
        <Link to="/" className="block text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-wider text-text-primary dark:text-text-primary-dark">
            VAULT{' '}
            <span className="text-accent">16</span>
          </h1>
          <p className="text-xs font-mono text-text-muted dark:text-text-muted-dark tracking-widest uppercase mt-1">
            Streetwear
          </p>
        </Link>

        {/* Card */}
        <div className="bg-bg-surface dark:bg-bg-surface-dark rounded-xl shadow-modal dark:shadow-modal-dark border border-border-base dark:border-border-base-dark p-6 sm:p-8">
          <Outlet />
        </div>
      </motion.div>
    </div>
  )
}
