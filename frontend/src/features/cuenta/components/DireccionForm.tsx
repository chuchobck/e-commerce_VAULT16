import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { createDireccion, updateDireccion, type Direccion } from '@/features/cuenta/api/cuentaApi'
import { useToast } from '@/shared/hooks/useToast'

interface DireccionFormData {
  alias: string
  callePrincipal: string
  numeracion: string
  calleSecundaria: string
  referencia: string
  barrio: string
  ciudad: string
  provincia: string
  pais: string
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
      callePrincipal: direccion?.callePrincipal || '',
      numeracion: direccion?.numeracion || '',
      calleSecundaria: direccion?.calleSecundaria || '',
      referencia: direccion?.referencia || '',
      barrio: direccion?.barrio || '',
      ciudad: direccion?.ciudad || '',
      provincia: direccion?.provincia || '',
      pais: direccion?.pais || 'Ecuador',
      codigoPostal: direccion?.codigoPostal || '',
      esPrincipal: direccion?.esPrincipal || false,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: DireccionFormData) => {
      const payload = {
        ...data,
        calleSecundaria: data.calleSecundaria || null,
        referencia: data.referencia || null,
        barrio: data.barrio || null,
        codigoPostal: data.codigoPostal || null,
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            label="Calle principal"
            placeholder="Av. Principal"
            error={errors.callePrincipal?.message}
            fullWidth
            {...register('callePrincipal', { required: 'Requerido' })}
          />
        </div>
        <Input
          label="Numeración"
          placeholder="N34-56"
          error={errors.numeracion?.message}
          fullWidth
          {...register('numeracion', { required: 'Requerido' })}
        />
      </div>

      <Input
        label="Calle secundaria (opcional)"
        placeholder="Calle transversal"
        fullWidth
        {...register('calleSecundaria')}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="País"
          fullWidth
          {...register('pais')}
        />
        <Input
          label="Código postal (opcional)"
          placeholder="170150"
          fullWidth
          {...register('codigoPostal')}
        />
      </div>

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
