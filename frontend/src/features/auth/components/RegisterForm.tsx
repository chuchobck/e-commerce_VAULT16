import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff, User, Phone, FileText } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { RegisterSchema, type RegisterInput } from '@/features/auth/schemas/auth.schemas'
import { useRegister } from '@/features/auth/hooks/useRegister'

function PasswordRules({ password }: { password: string }) {
  const rules = [
    { label: 'Mínimo 8 caracteres', valid: password.length >= 8 },
    { label: 'Una mayúscula', valid: /[A-Z]/.test(password) },
    { label: 'Un número', valid: /[0-9]/.test(password) },
  ]
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
      {rules.map((r) => (
        <span
          key={r.label}
          className={`text-xs flex items-center gap-1 ${
            r.valid
              ? 'text-status-success dark:text-status-success-dark'
              : 'text-text-muted dark:text-text-muted-dark'
          }`}
        >
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${r.valid ? 'bg-status-success dark:bg-status-success-dark' : 'bg-text-muted dark:bg-text-muted-dark'}`} />
          {r.label}
        </span>
      ))}
    </div>
  )
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const mutation = useRegister()

  // Preserve returnUrl so the link back to /login no pierde el contexto
  const returnUrl = searchParams.get('returnUrl')
  const loginHref = returnUrl
    ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
    : '/login'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { acceptTerms: false as unknown as true },
  })

  const password = watch('password') || ''

  const onSubmit = (data: RegisterInput) => mutation.mutate(data)

  // Nota: ya no hay pantalla intermedia de "¡Cuenta creada!". El hook
  // useRegister loguea al usuario y lo redirige al returnUrl directamente.

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nombre"
          type="text"
          placeholder="Juan"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.nombre1?.message}
          fullWidth
          autoComplete="given-name"
          {...register('nombre1')}
        />
        <Input
          label="Apellido"
          type="text"
          placeholder="Pérez"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.apellido1?.message}
          fullWidth
          autoComplete="family-name"
          {...register('apellido1')}
        />
      </div>

      <Input
        label="RUC o Cédula"
        type="text"
        placeholder="0912345678"
        leftIcon={<FileText className="h-4 w-4" />}
        error={errors.rucCedula?.message}
        fullWidth
        {...register('rucCedula')}
      />

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

      <Input
        label="Teléfono (opcional)"
        type="tel"
        placeholder="+593 99 123 4567"
        leftIcon={<Phone className="h-4 w-4" />}
        error={errors.telefono?.message}
        fullWidth
        autoComplete="tel"
        {...register('telefono')}
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
        <PasswordRules password={password} />
      </div>

      {/* Accept terms */}
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-border-base dark:border-border-base-dark accent-accent"
          {...register('acceptTerms')}
        />
        <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
          Acepto los{' '}
          <Link to="/terminos" className="text-accent hover:underline" target="_blank">
            términos y condiciones
          </Link>
          {' '}y la{' '}
          <Link to="/privacidad" className="text-accent hover:underline" target="_blank">
            política de privacidad
          </Link>
        </span>
      </label>
      {errors.acceptTerms && (
        <p className="text-sm text-status-danger dark:text-status-danger-dark -mt-2">
          {errors.acceptTerms.message}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={mutation.isPending}
      >
        Crear cuenta
      </Button>

      <p className="text-center text-sm text-text-secondary dark:text-text-secondary-dark">
        ¿Ya tenés cuenta?{' '}
        <Link to={loginHref} className="text-accent hover:underline font-medium">
          Iniciá sesión
        </Link>
      </p>
    </form>
  )
}
