import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { ResetPasswordSchema, type ResetPasswordInput } from '@/features/auth/schemas/auth.schemas'
import { useResetPassword } from '@/features/auth/hooks/useResetPassword'

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const mutation = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
  })

  const onSubmit = (data: ResetPasswordInput) =>
    mutation.mutate({ token, password: data.password })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
        Elegí tu nueva contraseña.
      </p>

      <div className="relative">
        <Input
          label="Nueva contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          fullWidth
          autoComplete="new-password"
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

      <Input
        label="Confirmar contraseña"
        type="password"
        placeholder="••••••••"
        leftIcon={<Lock className="h-4 w-4" />}
        error={errors.confirmPassword?.message}
        fullWidth
        autoComplete="new-password"
        {...register('confirmPassword')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={mutation.isPending}
      >
        Actualizar contraseña
      </Button>
    </form>
  )
}
