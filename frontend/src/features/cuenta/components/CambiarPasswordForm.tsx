import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { useMutation } from '@tanstack/react-query'
import { changePassword } from '@/features/cuenta/api/cuentaApi'
import { ChangePasswordSchema, type ChangePasswordInput } from '@/features/auth/schemas/auth.schemas'
import { useToast } from '@/shared/hooks/useToast'

export function CambiarPasswordForm() {
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const { success, error } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: ChangePasswordInput) =>
      changePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword }),
    onSuccess: () => {
      success('Contraseña actualizada')
      reset()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message
      error(msg || 'No pudimos cambiar tu contraseña')
    },
  })

  const onSubmit = (data: ChangePasswordInput) => mutation.mutate(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg" noValidate>
      <div className="relative">
        <Input
          label="Contraseña actual"
          type={showOld ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.oldPassword?.message}
          fullWidth
          autoComplete="current-password"
          {...register('oldPassword')}
        />
        <button
          type="button"
          onClick={() => setShowOld(!showOld)}
          className="absolute right-3 top-[34px] text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
          aria-label={showOld ? 'Ocultar' : 'Mostrar'}
        >
          {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Nueva contraseña"
          type={showNew ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.newPassword?.message}
          fullWidth
          autoComplete="new-password"
          {...register('newPassword')}
        />
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="absolute right-3 top-[34px] text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
          aria-label={showNew ? 'Ocultar' : 'Mostrar'}
        >
          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <Input
        label="Confirmar nueva contraseña"
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
        size="md"
        loading={mutation.isPending}
      >
        Cambiar contraseña
      </Button>
    </form>
  )
}
