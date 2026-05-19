import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MapPin, Plus, Check, ChevronDown } from 'lucide-react'
import {
  createDireccion,
  getDirecciones,
  type Direccion,
  type DireccionInput,
} from '@/features/cuenta/api/cuentaApi'
import { Input } from '@/shared/components/ui/Input'
import { cn } from '@/shared/utils/cn'

export interface DireccionSectionHandle {
  /** Returns the direccionId to use for checkout, creating a new address if needed. Returns null on validation error. */
  commit: () => Promise<number | null>
}

interface DireccionSectionProps {
  selectedId: number | null
  onSelect: (id: number | null) => void
}

interface NewAddressFormData {
  alias: string
  nombreDestinatario: string
  telefonoContacto: string
  direccion: string
  referencia: string
  ciudad: string
  provincia: string
  codigoPostal: string
}

export const DireccionSection = forwardRef<DireccionSectionHandle, DireccionSectionProps>(
  function DireccionSection({ selectedId, onSelect }, ref) {
    const queryClient = useQueryClient()
    const [expanded, setExpanded] = useState(false)
    const [mode, setMode] = useState<'existing' | 'new'>('existing')
    const [createError, setCreateError] = useState<string | null>(null)

    const { data: direcciones = [], isLoading } = useQuery({
      queryKey: ['direcciones'],
      queryFn: getDirecciones,
    })

    // Auto-select default (esPrincipal) or first.
    useEffect(() => {
      if (isLoading) return
      if (direcciones.length === 0 && mode === 'existing') {
        setMode('new')
        return
      }
      if (selectedId === null && direcciones.length > 0) {
        const def = direcciones.find((d) => d.esPrincipal) ?? direcciones[0]
        onSelect(def.id)
      }
    }, [isLoading, direcciones, selectedId, onSelect, mode])

    const {
      register,
      handleSubmit,
      formState: { errors },
      trigger,
      getValues,
    } = useForm<NewAddressFormData>({
      defaultValues: {
        alias: 'Casa',
        nombreDestinatario: '',
        telefonoContacto: '',
        direccion: '',
        referencia: '',
        ciudad: '',
        provincia: '',
        codigoPostal: '',
      },
    })

    const createMutation = useMutation({
      mutationFn: (data: NewAddressFormData) => {
        const payload: DireccionInput = {
          alias: data.alias,
          nombreDestinatario: data.nombreDestinatario,
          telefonoContacto: data.telefonoContacto,
          direccion: data.direccion,
          referencia: data.referencia || null,
          ciudad: data.ciudad,
          provincia: data.provincia,
          codigoPostal: data.codigoPostal || null,
          esPrincipal: direcciones.length === 0,
        }
        return createDireccion(payload)
      },
      onSuccess: (created) => {
        queryClient.invalidateQueries({ queryKey: ['direcciones'] })
        onSelect(created.id)
        setMode('existing')
      },
    })

    useImperativeHandle(ref, () => ({
      async commit() {
        setCreateError(null)
        if (mode === 'existing') {
          if (!selectedId) {
            setCreateError('Selecciona una dirección de envío')
            return null
          }
          return selectedId
        }
        // mode === 'new'
        const ok = await trigger()
        if (!ok) return null
        try {
          const created = await createMutation.mutateAsync(getValues())
          return created.id
        } catch (e) {
          setCreateError(
            e instanceof Error ? e.message : 'No pudimos guardar la dirección',
          )
          return null
        }
      },
    }))

    const selected = direcciones.find((d) => d.id === selectedId)

    if (isLoading) {
      return (
        <div className="space-y-3">
          <div className="h-6 w-48 rounded bg-bg-hover dark:bg-bg-hover-dark animate-pulse" />
          <div className="h-20 rounded-lg bg-bg-hover dark:bg-bg-hover-dark animate-pulse" />
        </div>
      )
    }

    return (
      <section
        id="seccion-direccion"
        className="p-6 rounded-lg border border-border-base dark:border-border-base-dark bg-bg-card dark:bg-bg-card-dark"
      >
        <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
          Dirección de envío
        </h2>

        {/* Existing addresses */}
        {mode === 'existing' && direcciones.length > 0 && (
          <div className="space-y-3">
            {/* Compact: show only selected unless expanded */}
            {(expanded ? direcciones : selected ? [selected] : []).map((dir: Direccion) => (
              <button
                key={dir.id}
                type="button"
                onClick={() => {
                  onSelect(dir.id)
                  setExpanded(false)
                }}
                className={cn(
                  'w-full text-left p-4 rounded-lg border-2 transition-all',
                  selectedId === dir.id
                    ? 'border-accent bg-accent/5'
                    : 'border-border-base dark:border-border-base-dark hover:border-accent/40 bg-bg-base dark:bg-bg-base-dark',
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <MapPin
                      className={cn(
                        'h-5 w-5 mt-0.5 flex-shrink-0',
                        selectedId === dir.id
                          ? 'text-accent'
                          : 'text-text-muted dark:text-text-muted-dark',
                      )}
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                          {dir.alias}
                        </span>
                        {dir.esPrincipal && (
                          <span className="text-xs px-1.5 py-0.5 bg-accent/10 text-accent rounded">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                        {dir.direccion}
                      </p>
                      <p className="text-xs text-text-muted dark:text-text-muted-dark">
                        {dir.ciudad}, {dir.provincia}
                      </p>
                    </div>
                  </div>
                  {selectedId === dir.id && !expanded && (
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}

            {/* Toggle: show other addresses */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {direcciones.length > 1 && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="text-sm text-accent hover:underline flex items-center gap-1"
                >
                  <ChevronDown
                    className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
                  />
                  {expanded ? 'Ocultar otras' : `Cambiar (${direcciones.length - 1} más)`}
                </button>
              )}
              <button
                type="button"
                onClick={() => setMode('new')}
                className="ml-auto text-sm text-text-secondary dark:text-text-secondary-dark hover:text-accent flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Nueva dirección
              </button>
            </div>
          </div>
        )}

        {/* New address inline form */}
        {mode === 'new' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {direcciones.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMode('existing')
                  setCreateError(null)
                }}
                className="text-sm text-text-secondary dark:text-text-secondary-dark hover:text-accent"
              >
                ← Usar dirección guardada
              </button>
            )}

            <form onSubmit={handleSubmit(() => {})} className="space-y-4">
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
            </form>
          </motion.div>
        )}

        {createError && (
          <p className="mt-3 text-sm text-status-danger dark:text-status-danger-dark">
            {createError}
          </p>
        )}
      </section>
    )
  },
)
