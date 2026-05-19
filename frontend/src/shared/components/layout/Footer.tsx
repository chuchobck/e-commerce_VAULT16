import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Twitter } from 'lucide-react'
import { Logo } from './Logo'
import { useToast } from '@/shared/hooks/useToast'

const SHOP_LINKS = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/promociones', label: 'Promociones' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/acerca', label: 'Quiénes somos' },
] as const

const LEGAL_LINKS = [
  { to: '/terminos', label: 'Términos y condiciones' },
  { to: '/privacidad', label: 'Política de privacidad' },
] as const

/**
 * Footer del e-commerce.
 * 4 columnas desktop: Marca | Navegación | Legales | Newsletter
 * Stack en mobile. Fondo oscuro siempre.
 */
export function Footer() {
  const [email, setEmail] = useState('')
  const { info } = useToast()

  const handleNewsletterSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!email.trim()) return

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return
      }

      info('¡Pronto te avisaremos de los próximos drops!')
      setEmail('')
    },
    [email, info],
  )

  return (
    <footer className="bg-asphalt-900 dark:bg-asphalt-950 text-asphalt-300">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* COL 1 — Marca */}
          <div className="space-y-4">
            <div className="[&_span]:!text-white [&_span:last-child]:!text-accent">
              <Logo />
            </div>
            <p className="text-sm text-asphalt-300 leading-relaxed max-w-xs">
              Streetwear urbano. Hecho en Quito.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-asphalt-400 hover:text-accent transition-colors duration-fast"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-asphalt-400 hover:text-accent transition-colors duration-fast"
                aria-label="Twitter / X"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* COL 2 — Navegación */}
          <div>
            <h3 className="text-sm font-semibold text-asphalt-100 uppercase tracking-wider mb-4">
              Tienda
            </h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-asphalt-300 hover:text-accent transition-colors duration-fast"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 3 — Legales */}
          <div>
            <h3 className="text-sm font-semibold text-asphalt-100 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-asphalt-300 hover:text-accent transition-colors duration-fast"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COL 4 — Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-asphalt-100 uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-asphalt-300 mb-4">
              Enterate primero de los próximos drops. Sin spam.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 h-10 px-3 rounded-md text-sm bg-asphalt-800 border border-asphalt-600 text-asphalt-100 placeholder:text-asphalt-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                aria-label="Email para newsletter"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-md text-sm font-medium bg-accent hover:bg-accent-hover text-white transition-colors duration-fast whitespace-nowrap"
              >
                Suscribirme
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-asphalt-700">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-asphalt-400">
            © 2026 VAULT 16. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-xs text-asphalt-400 hover:text-accent transition-colors duration-fast"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
