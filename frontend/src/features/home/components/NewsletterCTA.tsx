import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/Button'
import { useToast } from '@/shared/hooks/useToast'

const emailSchema = z.string().email('Ingresá un email válido')

/**
 * NewsletterCTA — email subscription section.
 * Validates with zod, shows toast on success.
 */
export function NewsletterCTA() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const { success } = useToast()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      const result = emailSchema.safeParse(email)
      if (!result.success) {
        setError(result.error.errors[0].message)
        return
      }

      success('¡Estás dentro! Te avisaremos de los próximos drops.')
      setEmail('')
    },
    [email, success],
  )

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="bg-bg-base dark:bg-bg-base-dark py-16 sm:py-20"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <Mail className="h-8 w-8 text-accent mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary dark:text-text-primary-dark">
          Enterate primero
        </h2>
        <p className="mt-3 text-text-secondary dark:text-text-secondary-dark">
          Drops nuevos, descuentos exclusivos. Cero spam.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-start gap-3 max-w-md mx-auto"
        >
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
              placeholder="tu@email.com"
              className={`
                w-full h-12 px-4 rounded-md text-base
                bg-bg-surface dark:bg-bg-hover-dark
                border ${error ? 'border-status-danger dark:border-status-danger-dark' : 'border-border-base dark:border-border-base-dark'}
                text-text-primary dark:text-text-primary-dark
                placeholder:text-text-muted dark:placeholder:text-text-muted-dark
                focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                transition-colors
              `}
              aria-label="Email para newsletter"
              aria-invalid={!!error}
            />
            {error && (
              <p className="text-xs text-status-danger dark:text-status-danger-dark mt-1 text-left" role="alert">
                {error}
              </p>
            )}
          </div>
          <Button type="submit" variant="primary" size="lg" className="h-12 whitespace-nowrap">
            Suscribirme
          </Button>
        </form>
      </div>
    </motion.section>
  )
}
