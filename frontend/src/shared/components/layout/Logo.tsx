import { Link } from 'react-router-dom'

/**
 * Logo VAULT 16
 * - Wordmark en font-mono bold uppercase tracking-tight
 * - "16" en color accent (azul eléctrico) — diferencial visual
 * - Wrapped en Link al home
 */
export function Logo() {
  return (
    <Link
      to="/"
      className="flex items-baseline gap-1 font-mono font-semibold tracking-tight select-none"
      aria-label="VAULT 16 — Ir al inicio"
    >
      <span className="text-2xl text-text-primary dark:text-text-primary-dark uppercase">
        VAULT
      </span>
      <span className="text-2xl text-accent uppercase">
        16
      </span>
    </Link>
  )
}
