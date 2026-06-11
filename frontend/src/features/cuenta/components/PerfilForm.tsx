import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { User, Phone, Mail, FileText } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { useAuthStore } from '@/shared/stores/authStore'
import { updateProfile } from '@/features/cuenta/api/cuentaApi'
import { useToast } from '@/shared/hooks/useToast'

// ─── Regex compiladas ────────────────────────────────────────────────────────
const NAME_REGEX = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]*$/
const PHONE_REGEX = /^\d*$/

interface ProfileFormData {
  nombre1: string
  apellido1: string
  telefono: string
}

export function PerfilForm() {
  const cliente = useAuthStore((s) => s.cliente)
  const updateStoreProfile = useAuthStore((s) => s.updateProfile)
  const { success, error } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      nombre1: cliente?.nombre1 || '',
      apellido1: cliente?.apellido1 || '',
      telefono: cliente?.telefono || '',
    },
  })

  // ─── Handlers eficientes para validación en tiempo real ───────────────────
  
  // Handler para nombre: solo letras y espacios
  const handleNameInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    if (value && !NAME_REGEX.test(value)) {
      e.currentTarget.value = value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, '')
    }
  }, [])

  // Handler para teléfono: solo números
  const handlePhoneInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    if (value && !PHONE_REGEX.test(value)) {
      e.currentTarget.value = value.replace(/[^\d]/g, '')
    }
  }, [])

  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => updateProfile(data),
    onSuccess: (updated) => {
      updateStoreProfile(updated)
      success('Perfil actualizado')
    },
    onError: () => {
      error('No pudimos actualizar tu perfil')
    },
  })

  const onSubmit = (data: ProfileFormData) => mutation.mutate(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      {/* Read-only fields */}
      <Input
        label="Email"
        type="email"
        value={cliente?.email || ''}
        leftIcon={<Mail className="h-4 w-4" />}
        fullWidth
        disabled
        hint="El email no se puede cambiar"
      />

      <Input
        label="RUC / Cédula"
        type="text"
        value={cliente?.rucCedula || ''}
        leftIcon={<FileText className="h-4 w-4" />}
        fullWidth
        disabled
      />

      {/* Editable fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nombre"
          type="text"
          placeholder="Juan"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.nombre1?.message}
          fullWidth
          onInput={handleNameInput}
          {...register('nombre1', { required: 'Requerido' })}
        />
        <Input
          label="Apellido"
          type="text"
          placeholder="Pérez"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.apellido1?.message}
          fullWidth
          onInput={handleNameInput}
          {...register('apellido1', { required: 'Requerido' })}
        />
      </div>

      <Input
        label="Teléfono"
        type="tel"
        placeholder="0991234567"
        leftIcon={<Phone className="h-4 w-4" />}
        error={errors.telefono?.message}
        fullWidth
        onInput={handlePhoneInput}
        {...register('telefono')}
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={mutation.isPending}
        disabled={!isDirty}
      >
        Guardar cambios
      </Button>
    </form>
  )
}
