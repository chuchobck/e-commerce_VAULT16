import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import {
  createDireccion,
  updateDireccion,
  type Direccion,
  type DireccionInput,
} from '@/features/cuenta/api/cuentaApi'
import { useToast } from '@/shared/hooks/useToast'

interface DireccionFormData {
  alias: string
  nombreDestinatario: string
  telefonoContacto: string
  direccion: string
  referencia: string
  ciudad: string
  provincia: string
  codigoPostal: string
  esPrincipal: boolean
}

interface DireccionFormProps {
  direccion?: Direccion
  onClose: () => void
}

export function DireccionForm({ direccion, onClose }: DireccionFormProps) {
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const isEditing = !!direccion

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DireccionFormData>({
    defaultValues: {
      alias: direccion?.alias || '',
      nombreDestinatario: direccion?.nombreDestinatario || '',
      telefonoContacto: direccion?.telefonoContacto || '',
      direccion: direccion?.direccion || '',
      referencia: direccion?.referencia || '',
      ciudad: direccion?.ciudad || '',
      provincia: direccion?.provincia || '',
      codigoPostal: direccion?.codigoPostal || '',
      esPrincipal: direccion?.esPrincipal || false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: DireccionFormData) => {
      const payload: DireccionInput = {
        alias: data.alias,
        nombreDestinatario: data.nombreDestinatario,
        telefonoContacto: data.telefonoContacto,
        direccion: data.direccion,
        referencia: data.referencia || null,
        ciudad: data.ciudad,
        provincia: data.provincia,
        codigoPostal: data.codigoPostal || null,
        esPrincipal: data.esPrincipal,
      }
      if (isEditing) {
        return updateDireccion(direccion.id, payload)
      }
      return createDireccion(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] })
      success(isEditing ? 'Dirección actualizada' : 'Dirección agregada')
      onClose()
    },
    onError: () => {
      error('No pudimos guardar la dirección')
    },
  })

  const onSubmit = (data: DireccionFormData) => mutation.mutate(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
        {isEditing ? 'Editar dirección' : 'Nueva dirección'}
      </h3>

      <Input
        label="Alias"
        placeholder='ej: "Casa", "Oficina"'
        error={errors.alias?.message}
        fullWidth
        {...register('alias', { required: 'Requerido' })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Nombre del destinatario"
          placeholder="Juan Pérez"
          error={errors.nombreDestinatario?.message}
          fullWidth
          {...register('nombreDestinatario', { required: 'Requerido' })}
        />
        <Input
          label="Teléfono de contacto"
          placeholder="0991234567"
          error={errors.telefonoContacto?.message}
          fullWidth
          {...register('telefonoContacto', { required: 'Requerido' })}
        />
      </div>

      <Input
        label="Dirección"
        placeholder="Av. Principal N34-56 y Calle Secundaria"
        error={errors.direccion?.message}
        fullWidth
        {...register('direccion', { required: 'Requerido' })}
      />

      <Input
        label="Referencia (opcional)"
        placeholder="Junto al parque central"
        fullWidth
        {...register('referencia')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Ciudad"
          placeholder="Quito"
          error={errors.ciudad?.message}
          fullWidth
          {...register('ciudad', { required: 'Requerido' })}
        />
        <Input
          label="Provincia"
          placeholder="Pichincha"
          error={errors.provincia?.message}
          fullWidth
          {...register('provincia', { required: 'Requerido' })}
        />
      </div>

      <Input
        label="Código postal (opcional)"
        placeholder="170150"
        fullWidth
        {...register('codigoPostal')}
      />

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border-base dark:border-border-base-dark accent-accent"
          {...register('esPrincipal')}
        />
        <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
          Marcar como dirección principal
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="md" loading={mutation.isPending}>
          {isEditing ? 'Guardar' : 'Agregar'}
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
