import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Ruler } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import {
  calcularTallaTop,
  calcularTallaPant,
  getTopChart,
  getPantChart,
  type TallaResultado,
} from '@/features/producto/utils/sizeCalculator'

type TipoMedida = 'top' | 'pant'
type Fit = 'ajustado' | 'regular' | 'oversize'

// ─── Body Diagram SVG ────────────────────────────────────────────────────────

function BodyDiagram({
  tipo,
  activeMeasure,
}: {
  tipo: TipoMedida
  activeMeasure: 'pecho' | 'cintura' | 'cadera' | null
}) {
  return (
    <svg viewBox="0 0 200 400" className="w-full max-w-[200px] mx-auto h-auto" aria-hidden="true">
      {/* Head */}
      <circle cx="100" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted dark:text-text-muted-dark" />
      {/* Neck */}
      <line x1="100" y1="60" x2="100" y2="80" stroke="currentColor" strokeWidth="1.5" className="text-text-muted dark:text-text-muted-dark" />
      {/* Shoulders */}
      <line x1="55" y1="80" x2="145" y2="80" stroke="currentColor" strokeWidth="1.5" className="text-text-muted dark:text-text-muted-dark" />
      {/* Torso */}
      <path
        d="M55,80 L50,190 Q100,200 150,190 L145,80"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-text-muted dark:text-text-muted-dark"
      />
      {/* Arms */}
      <line x1="55" y1="80" x2="30" y2="180" stroke="currentColor" strokeWidth="1.5" className="text-text-muted dark:text-text-muted-dark" />
      <line x1="145" y1="80" x2="170" y2="180" stroke="currentColor" strokeWidth="1.5" className="text-text-muted dark:text-text-muted-dark" />
      {/* Legs */}
      <line x1="75" y1="190" x2="65" y2="360" stroke="currentColor" strokeWidth="1.5" className="text-text-muted dark:text-text-muted-dark" />
      <line x1="125" y1="190" x2="135" y2="360" stroke="currentColor" strokeWidth="1.5" className="text-text-muted dark:text-text-muted-dark" />
      {/* Feet */}
      <line x1="55" y1="360" x2="75" y2="360" stroke="currentColor" strokeWidth="1.5" className="text-text-muted dark:text-text-muted-dark" />
      <line x1="125" y1="360" x2="145" y2="360" stroke="currentColor" strokeWidth="1.5" className="text-text-muted dark:text-text-muted-dark" />

      {/* Measurement lines */}
      {/* Pecho (chest) — y=110 */}
      {tipo === 'top' && (
        <g>
          <line
            x1="40" y1="110" x2="160" y2="110"
            stroke={activeMeasure === 'pecho' ? '#3B82F6' : '#60A5FA'}
            strokeWidth="2"
            strokeDasharray="6 3"
            className={activeMeasure === 'pecho' ? 'animate-pulse' : ''}
          />
          <text x="165" y="114" fontSize="10" fontFamily="'JetBrains Mono', monospace" fill={activeMeasure === 'pecho' ? '#3B82F6' : '#60A5FA'} className="uppercase">
            Pecho
          </text>
        </g>
      )}

      {/* Cintura (waist) — y=155 */}
      {tipo === 'pant' && (
        <>
          <g>
            <line
              x1="42" y1="155" x2="158" y2="155"
              stroke={activeMeasure === 'cintura' ? '#3B82F6' : '#60A5FA'}
              strokeWidth="2"
              strokeDasharray="6 3"
              className={activeMeasure === 'cintura' ? 'animate-pulse' : ''}
            />
            <text x="163" y="159" fontSize="10" fontFamily="'JetBrains Mono', monospace" fill={activeMeasure === 'cintura' ? '#3B82F6' : '#60A5FA'} className="uppercase">
              Cintura
            </text>
          </g>
          {/* Cadera (hips) — y=195 */}
          <g>
            <line
              x1="45" y1="195" x2="155" y2="195"
              stroke={activeMeasure === 'cadera' ? '#3B82F6' : '#60A5FA'}
              strokeWidth="2"
              strokeDasharray="6 3"
              className={activeMeasure === 'cadera' ? 'animate-pulse' : ''}
            />
            <text x="160" y="199" fontSize="10" fontFamily="'JetBrains Mono', monospace" fill={activeMeasure === 'cadera' ? '#3B82F6' : '#60A5FA'} className="uppercase">
              Cadera
            </text>
          </g>
        </>
      )}
    </svg>
  )
}

// ─── Confianza Badge ─────────────────────────────────────────────────────────

function ConfianzaBadge({ confianza }: { confianza: TallaResultado['confianza'] }) {
  const config = {
    alta:  { color: 'bg-status-success/10 text-status-success dark:text-status-success-dark', label: '🟢 ALTA' },
    media: { color: 'bg-status-warning/10 text-status-warning dark:text-status-warning-dark', label: '🟡 MEDIA' },
    baja:  { color: 'bg-status-danger/10 text-status-danger dark:text-status-danger-dark', label: '🔴 BAJA' },
  }
  const c = config[confianza]
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${c.color}`}>
      {c.label}
    </span>
  )
}

// ─── Size Calculator Modal ───────────────────────────────────────────────────

interface SizeCalculatorModalProps {
  open: boolean
  onClose: () => void
  categoriaSlug: string
  onApplyTalla: (talla: string) => void
}

export function SizeCalculatorModal({
  open,
  onClose,
  categoriaSlug,
  onApplyTalla,
}: SizeCalculatorModalProps) {
  // Auto-detect type from category
  const defaultTipo: TipoMedida = ['pants', 'pan'].some((s) =>
    categoriaSlug.toLowerCase().includes(s),
  )
    ? 'pant'
    : 'top'

  const [tipo, setTipo] = useState<TipoMedida>(defaultTipo)
  const [pecho, setPecho] = useState('')
  const [cintura, setCintura] = useState('')
  const [cadera, setCadera] = useState('')
  const [fit, setFit] = useState<Fit>('regular')

  // Reset when type changes
  useEffect(() => {
    setPecho('')
    setCintura('')
    setCadera('')
  }, [tipo])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Determine active measure for diagram highlight
  const activeMeasure = useMemo(() => {
    if (tipo === 'top') return pecho ? null : 'pecho' as const
    if (!cintura) return 'cintura' as const
    if (!cadera) return 'cadera' as const
    return null
  }, [tipo, pecho, cintura, cadera])

  // Validate inputs
  const isValid = useMemo(() => {
    if (tipo === 'top') {
      const p = Number(pecho)
      return p >= 50 && p <= 150
    }
    const c = Number(cintura)
    const h = Number(cadera)
    return c >= 50 && c <= 150 && h >= 50 && h <= 150
  }, [tipo, pecho, cintura, cadera])

  // Calculate result
  const resultado: TallaResultado | null = useMemo(() => {
    if (!isValid) return null
    if (tipo === 'top') {
      return calcularTallaTop(Number(pecho), fit)
    }
    return calcularTallaPant(Number(cintura), Number(cadera), fit)
  }, [isValid, tipo, pecho, cintura, cadera, fit])

  const handleApply = useCallback(() => {
    if (resultado) {
      onApplyTalla(resultado.talla)
      onClose()
    }
  }, [resultado, onApplyTalla, onClose])

  const topChart = useMemo(() => getTopChart(), [])
  const pantChart = useMemo(() => getPantChart(), [])

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-modal flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-surface dark:bg-bg-surface-dark rounded-xl shadow-modal dark:shadow-modal-dark p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Calculadora de tallas"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-md text-text-muted hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <Ruler className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark">
                Guía de tallas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left — Body diagram */}
              <div className="flex items-center justify-center">
                <BodyDiagram tipo={tipo} activeMeasure={activeMeasure} />
              </div>

              {/* Right — Calculator */}
              <div className="space-y-6">
                {/* Step 1: Type */}
                <div>
                  <label className="text-sm font-medium text-text-primary dark:text-text-primary-dark block mb-2">
                    ¿Qué vas a medir?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTipo('top')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-colors ${
                        tipo === 'top'
                          ? 'bg-accent text-white border-accent'
                          : 'border-border-base dark:border-border-base-dark text-text-secondary dark:text-text-secondary-dark hover:border-accent'
                      }`}
                    >
                      Top
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipo('pant')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-colors ${
                        tipo === 'pant'
                          ? 'bg-accent text-white border-accent'
                          : 'border-border-base dark:border-border-base-dark text-text-secondary dark:text-text-secondary-dark hover:border-accent'
                      }`}
                    >
                      Pants
                    </button>
                  </div>
                </div>

                {/* Step 2: Measurements */}
                <div>
                  <label className="text-sm font-medium text-text-primary dark:text-text-primary-dark block mb-2">
                    Tus medidas (cm)
                  </label>
                  <p className="text-xs text-text-muted dark:text-text-muted-dark mb-3">
                    Medí con cinta métrica sobre la prenda más ajustada que uses.
                  </p>

                  {tipo === 'top' ? (
                    <div>
                      <label className="text-xs text-text-secondary dark:text-text-secondary-dark mb-1 block">Pecho</label>
                      <input
                        type="number"
                        min="50"
                        max="150"
                        value={pecho}
                        onChange={(e) => setPecho(e.target.value)}
                        placeholder="ej: 98"
                        className="w-full h-10 px-3 rounded-md text-sm border border-border-base dark:border-border-base-dark bg-bg-base dark:bg-bg-hover-dark text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent"
                        aria-label="Medida de pecho en centímetros"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-text-secondary dark:text-text-secondary-dark mb-1 block">Cintura</label>
                        <input
                          type="number"
                          min="50"
                          max="150"
                          value={cintura}
                          onChange={(e) => setCintura(e.target.value)}
                          placeholder="ej: 85"
                          className="w-full h-10 px-3 rounded-md text-sm border border-border-base dark:border-border-base-dark bg-bg-base dark:bg-bg-hover-dark text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent"
                          aria-label="Medida de cintura en centímetros"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-secondary dark:text-text-secondary-dark mb-1 block">Cadera</label>
                        <input
                          type="number"
                          min="50"
                          max="150"
                          value={cadera}
                          onChange={(e) => setCadera(e.target.value)}
                          placeholder="ej: 100"
                          className="w-full h-10 px-3 rounded-md text-sm border border-border-base dark:border-border-base-dark bg-bg-base dark:bg-bg-hover-dark text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent"
                          aria-label="Medida de cadera en centímetros"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: Fit preference */}
                <div>
                  <label className="text-sm font-medium text-text-primary dark:text-text-primary-dark block mb-2">
                    ¿Cómo te gusta que te quede?
                  </label>
                  <div className="flex gap-2">
                    {(['ajustado', 'regular', 'oversize'] as Fit[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFit(f)}
                        className={`flex-1 py-2 px-2 rounded-md text-xs font-medium border capitalize transition-colors ${
                          fit === f
                            ? 'bg-accent text-white border-accent'
                            : 'border-border-base dark:border-border-base-dark text-text-secondary dark:text-text-secondary-dark hover:border-accent'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result */}
                <AnimatePresence>
                  {resultado && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 rounded-lg bg-bg-hover dark:bg-bg-hover-dark border border-border-base dark:border-border-base-dark"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-xs font-mono uppercase tracking-wider text-text-muted dark:text-text-muted-dark">
                            Tu talla
                          </p>
                          <p className="text-3xl font-semibold text-accent">
                            {resultado.talla}
                          </p>
                        </div>
                        <ConfianzaBadge confianza={resultado.confianza} />
                      </div>
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-2">
                        {resultado.mensaje}
                      </p>

                      <Button
                        variant="primary"
                        fullWidth
                        className="mt-4"
                        onClick={handleApply}
                      >
                        Aplicar talla {resultado.talla} y cerrar
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Reference table */}
            <div className="mt-8 pt-6 border-t border-border-base dark:border-border-base-dark">
              <h3 className="text-sm font-medium text-text-primary dark:text-text-primary-dark mb-3">
                Tabla de referencia
              </h3>
              {tipo === 'top' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-base dark:border-border-base-dark">
                        <th className="text-left py-2 pr-4 text-text-muted dark:text-text-muted-dark font-medium">Talla</th>
                        <th className="text-left py-2 text-text-muted dark:text-text-muted-dark font-medium">Pecho</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topChart.map((row) => (
                        <tr
                          key={row.talla}
                          className={`border-b border-border-base/50 dark:border-border-base-dark/50 ${
                            resultado?.talla === row.talla ? 'bg-accent/5' : ''
                          }`}
                        >
                          <td className={`py-2 pr-4 font-mono ${resultado?.talla === row.talla ? 'text-accent font-semibold' : 'text-text-primary dark:text-text-primary-dark'}`}>
                            {row.talla}
                          </td>
                          <td className="py-2 text-text-secondary dark:text-text-secondary-dark">{row.pecho}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-base dark:border-border-base-dark">
                        <th className="text-left py-2 pr-4 text-text-muted dark:text-text-muted-dark font-medium">Talla</th>
                        <th className="text-left py-2 pr-4 text-text-muted dark:text-text-muted-dark font-medium">Cintura</th>
                        <th className="text-left py-2 text-text-muted dark:text-text-muted-dark font-medium">Cadera</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pantChart.map((row) => (
                        <tr
                          key={row.talla}
                          className={`border-b border-border-base/50 dark:border-border-base-dark/50 ${
                            resultado?.talla === row.talla ? 'bg-accent/5' : ''
                          }`}
                        >
                          <td className={`py-2 pr-4 font-mono ${resultado?.talla === row.talla ? 'text-accent font-semibold' : 'text-text-primary dark:text-text-primary-dark'}`}>
                            {row.talla}
                          </td>
                          <td className="py-2 pr-4 text-text-secondary dark:text-text-secondary-dark">{row.cintura}</td>
                          <td className="py-2 text-text-secondary dark:text-text-secondary-dark">{row.cadera}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
