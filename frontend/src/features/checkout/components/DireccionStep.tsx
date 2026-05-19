import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MapPin, Plus, Check } from 'lucide-react'
import { getDirecciones, type Direccion } from '@/features/cuenta/api/cuentaApi'
import { DireccionForm } from '@/features/cuenta/components/DireccionForm'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'

interface DireccionStepProps {
  selectedId: number | null
  onSelect: (id: number) => void
  onContinue: () => void
}

export function DireccionStep({ selectedId, onSelect, onContinue }: DireccionStepProps) {
  const [showCreate, setShowCreate] = useState(false)

  const { data: direcciones = [], isLoading, refetch } = useQuery({
    queryKey: ['direcciones'],
    queryFn: getDirecciones,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="animate-pulse h-20 rounded-lg bg-bg-hover dark:bg-bg-hover-dark" />
        ))}
      </div>
    )
  }

  if (direcciones.length === 0 && !showCreate) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <MapPin className="h-10 w-10 text-text-muted dark:text-text-muted-dark mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-1">
          Agregá una dirección de envío
        </h3>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-6">
          Necesitás al menos una dirección para continuar.
        </p>
        <Button variant="primary" size="md" onClick={() => setShowCreate(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Agregar dirección
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
        ¿A dónde enviamos tu pedido?
      </h3>

      <div className="space-y-3">
        {direcciones.map((dir: Direccion) => (
          <button
            key={dir.id}
            type="button"
            onClick={() => onSelect(dir.id)}
            className={cn(
              'w-full text-left p-4 rounded-lg border-2 transition-all',
              selectedId === dir.id
                ? 'border-accent bg-accent/5'
                : 'border-border-base dark:border-border-base-dark hover:border-accent/40 bg-bg-card dark:bg-bg-card-dark',
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <MapPin className={cn('h-5 w-5 mt-0.5 flex-shrink-0', selectedId === dir.id ? 'text-accent' : 'text-text-muted dark:text-text-muted-dark')} />
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
              {selectedId === dir.id && (
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {showCreate ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border border-accent/30 bg-bg-card dark:bg-bg-card-dark"
        >
          <DireccionForm
            onClose={() => {
              setShowCreate(false)
              refetch()
            }}
          />
        </motion.div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border-base dark:border-border-base-dark text-sm text-text-secondary dark:text-text-secondary-dark hover:text-accent hover:border-accent/40 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agregar nueva dirección
        </button>
      )}

      <div className="pt-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedId}
          onClick={onContinue}
        >
          Continuar al pago
        </Button>
      </div>
    </div>
  )
}
