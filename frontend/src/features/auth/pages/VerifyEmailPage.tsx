import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { useVerifyEmail } from '@/features/auth/hooks/useVerifyEmail'
import { useAuthStore } from '@/shared/stores/authStore'

export function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const mutation = useVerifyEmail()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const updateProfile = useAuthStore((s) => s.updateProfile)

  useEffect(() => {
    if (token) {
      mutation.mutate(token)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Cuando verifica con éxito y ya está logueado, actualizamos el estado
  // local y lo dejamos donde estaba (no lo mandamos a /login de nuevo).
  useEffect(() => {
    if (mutation.isSuccess && isAuthenticated) {
      updateProfile({ emailVerificado: true })
    }
  }, [mutation.isSuccess, isAuthenticated, updateProfile])

  if (mutation.isPending) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
        <p className="text-text-secondary dark:text-text-secondary-dark">
          Verificando tu email...
        </p>
      </div>
    )
  }

  if (mutation.isError) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-status-danger-bg dark:bg-status-danger-bg-dark flex items-center justify-center mb-4">
          <XCircle className="h-8 w-8 text-status-danger dark:text-status-danger-dark" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          Error de verificación
        </h3>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
          El link expiró o es inválido. Intentá registrarte nuevamente.
        </p>
        <Link to="/register">
          <Button variant="primary" size="md">
            Registrarse
          </Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
      <div className="mx-auto w-16 h-16 rounded-full bg-status-success-bg dark:bg-status-success-bg-dark flex items-center justify-center mb-4">
        <CheckCircle className="h-8 w-8 text-status-success dark:text-status-success-dark" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
        ¡Email verificado!
      </h3>
      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
        {isAuthenticated
          ? 'Tu cuenta quedó completamente activa.'
          : 'Tu cuenta está activa. Ya podés iniciar sesión.'}
      </p>
      <Button
        variant="primary"
        size="md"
        onClick={() => navigate(isAuthenticated ? '/' : '/login')}
      >
        {isAuthenticated ? 'Ir al inicio' : 'Iniciar sesión'}
      </Button>
    </motion.div>
  )
}
