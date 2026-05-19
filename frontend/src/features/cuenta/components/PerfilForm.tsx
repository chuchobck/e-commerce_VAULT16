import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { User, Phone, Mail, FileText } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { useAuthStore } from '@/shared/stores/authStore'
import { updateProfile } from '@/features/cuenta/api/cuentaApi'
import { useToast } from '@/shared/hooks/useToast'

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
          {...register('nombre1', { required: 'Requerido' })}
        />
        <Input
          label="Apellido"
          type="text"
          placeholder="Pérez"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.apellido1?.message}
          fullWidth
          {...register('apellido1', { required: 'Requerido' })}
        />
      </div>

      <Input
        label="Teléfono"
        type="tel"
        placeholder="+593 99 123 4567"
        leftIcon={<Phone className="h-4 w-4" />}
        error={errors.telefono?.message}
        fullWidth
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
