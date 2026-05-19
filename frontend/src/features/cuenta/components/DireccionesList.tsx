import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Plus, Trash2, Edit2, Star } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { getDirecciones, deleteDireccion, setDireccionPrincipal } from '@/features/cuenta/api/cuentaApi'
import { DireccionForm } from './DireccionForm'
import { useToast } from '@/shared/hooks/useToast'

export function DireccionesList() {
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data: direcciones = [], isLoading } = useQuery({
    queryKey: ['direcciones'],
    queryFn: getDirecciones,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDireccion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] })
      success('Dirección eliminada')
    },
    onError: () => error('No pudimos eliminar la dirección'),
  })

  const setPrincipalMutation = useMutation({
    mutationFn: (id: number) => setDireccionPrincipal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] })
      success('Dirección principal actualizada')
    },
    onError: () => error('No pudimos actualizar la dirección'),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="animate-pulse h-24 rounded-lg bg-bg-hover dark:bg-bg-hover-dark" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {direcciones.map((dir) => (
          <motion.div
            key={dir.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 rounded-lg border border-border-base dark:border-border-base-dark bg-bg-card dark:bg-bg-card-dark"
          >
            {editingId === dir.id ? (
              <DireccionForm
                direccion={dir}
                onClose={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                        {dir.alias}
                      </span>
                      {dir.esPrincipal && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded">
                          <Star className="h-3 w-3" />
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark truncate">
                      {dir.direccion}
                    </p>
                    <p className="text-xs text-text-muted dark:text-text-muted-dark">
                      {dir.ciudad}, {dir.provincia}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {!dir.esPrincipal && (
                    <button
                      type="button"
                      onClick={() => setPrincipalMutation.mutate(dir.id)}
                      className="p-1.5 rounded text-text-muted dark:text-text-muted-dark hover:text-accent hover:bg-accent/10 transition-colors"
                      title="Marcar como principal"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingId(dir.id)}
                    className="p-1.5 rounded text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(dir.id)}
                    className="p-1.5 rounded text-text-muted dark:text-text-muted-dark hover:text-status-danger dark:hover:text-status-danger-dark hover:bg-status-danger-bg dark:hover:bg-status-danger-bg-dark transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {showCreate ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border border-accent/30 bg-bg-card dark:bg-bg-card-dark"
        >
          <DireccionForm onClose={() => setShowCreate(false)} />
        </motion.div>
      ) : (
        <Button
          variant="secondary"
          size="md"
          fullWidth
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreate(true)}
        >
          Agregar dirección
        </Button>
      )}
    </div>
  )
}
