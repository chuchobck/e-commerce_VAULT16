import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { ForgotPasswordSchema, type ForgotPasswordInput } from '@/features/auth/schemas/auth.schemas'
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword'

export function ForgotPasswordForm() {
  const mutation = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  })

  const onSubmit = (data: ForgotPasswordInput) => mutation.mutate(data.email)

  if (mutation.isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
          Revisá tu email
        </h3>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
          Si el email existe en nuestro sistema, te enviamos un link para resetear tu contraseña.
        </p>
        <Link to="/login">
          <Button variant="secondary" size="md">
            Volver a login
          </Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
        Ingresá tu email y te enviaremos un link para resetear tu contraseña.
      </p>

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        fullWidth
        autoComplete="email"
        {...register('email')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={mutation.isPending}
      >
        Enviar link
      </Button>

      <p className="text-center text-sm text-text-secondary dark:text-text-secondary-dark">
        <Link to="/login" className="text-accent hover:underline">
          ← Volver a login
        </Link>
      </p>
    </form>
  )
}
