import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { LoginSchema, type LoginInput } from '@/features/auth/schemas/auth.schemas'
import { useLogin } from '@/features/auth/hooks/useLogin'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const mutation = useLogin()

  // Pasamos el returnUrl al link de registro para no perder el destino
  const returnUrl = searchParams.get('returnUrl')
  const registerHref = returnUrl
    ? `/register?returnUrl=${encodeURIComponent(returnUrl)}`
    : '/register'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = (data: LoginInput) => mutation.mutate(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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

      <div>
        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            fullWidth
            autoComplete="current-password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="text-right mt-1.5">
          <Link
            to="/forgot-password"
            className="text-sm text-accent hover:underline transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={mutation.isPending}
      >
        Iniciar sesión
      </Button>

      <p className="text-center text-sm text-text-secondary dark:text-text-secondary-dark">
        ¿No tenés cuenta?{' '}
        <Link to={registerHref} className="text-accent hover:underline font-medium">
          Registrate
        </Link>
      </p>
    </form>
  )
}
