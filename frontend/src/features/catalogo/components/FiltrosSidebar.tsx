import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchCategorias } from '@/features/catalogo/api/catalogoApi'
import type { Filtros } from '@/features/catalogo/hooks/useFiltros'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/utils/cn'

// ─── Available tallas (hardcoded — backend returns simple list) ──────────────

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ÚNICA']

// ─── Available colors (hardcoded — no aggregate endpoint yet) ────────────────

const COLORES = [
  { nombre: 'Negro', hex: '#1a1a1a' },
  { nombre: 'Antracita', hex: '#353C42' },
  { nombre: 'Carbón', hex: '#2E353B' },
  { nombre: 'Pizarra', hex: '#4A535A' },
  { nombre: 'Hueso', hex: '#F5F0E8' },
  { nombre: 'Arena', hex: '#C8B89A' },
  { nombre: 'Cemento', hex: '#9AA3AB' },
  { nombre: 'Oliva', hex: '#5C6B4F' },
  { nombre: 'Verde Mil', hex: '#4A5C3E' },
  { nombre: 'Beige', hex: '#D4C4A8' },
  { nombre: 'Marrón', hex: '#6B4E37' },
  { nombre: 'Gris Mel', hex: '#8C8C8C' },
  { nombre: 'Blanco', hex: '#F8F8F8' },
]

// ─── Collapsible section ─────────────────────────────────────────────────────

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border-base dark:border-border-base-dark py-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-medium text-text-primary dark:text-text-primary-dark"
        aria-expanded={open}
      >
        {title}
        {open ? (
          <ChevronUp className="h-4 w-4 text-text-muted" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── FiltrosSidebar ──────────────────────────────────────────────────────────

interface FiltrosSidebarProps {
  filtros: Filtros
  setFiltro: (key: string, value: string | string[] | number | undefined) => void
  clearFiltros: () => void
  hasActiveFilters: boolean
  onClose?: () => void
  isMobile?: boolean
}

export function FiltrosSidebar({
  filtros,
  setFiltro,
  clearFiltros,
  hasActiveFilters,
  onClose,
  isMobile,
}: FiltrosSidebarProps) {
  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: fetchCategorias,
  })

  // ── Categoría ──────────────────────────────────────────────────────────

  const handleCategoriaClick = useCallback(
    (catId: string) => {
      setFiltro(
        'categoriaId',
        filtros.categoriaId === catId ? undefined : catId,
      )
    },
    [filtros.categoriaId, setFiltro],
  )

  // ── Talla ──────────────────────────────────────────────────────────────

  const handleTallaToggle = useCallback(
    (talla: string) => {
      const current = filtros.talla || []
      const next = current.includes(talla)
        ? current.filter((t) => t !== talla)
        : [...current, talla]
      setFiltro('talla', next.length > 0 ? next : undefined)
    },
    [filtros.talla, setFiltro],
  )

  // ── Color ──────────────────────────────────────────────────────────────

  const handleColorToggle = useCallback(
    (color: string) => {
      const current = filtros.color || []
      const next = current.includes(color)
        ? current.filter((c) => c !== color)
        : [...current, color]
      setFiltro('color', next.length > 0 ? next : undefined)
    },
    [filtros.color, setFiltro],
  )

  // ── Price ──────────────────────────────────────────────────────────────

  const handlePrecioMin = useCallback(
    (value: string) => {
      const num = value ? Number(value) : undefined
      setFiltro('precioMin', num && num > 0 ? num : undefined)
    },
    [setFiltro],
  )

  const handlePrecioMax = useCallback(
    (value: string) => {
      const num = value ? Number(value) : undefined
      setFiltro('precioMax', num && num > 0 ? num : undefined)
    },
    [setFiltro],
  )

  return (
    <aside
      className={cn(
        'w-full lg:w-[280px] flex-shrink-0',
        !isMobile && 'sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide',
      )}
    >
      {/* Mobile header */}
      {isMobile && (
        <div className="flex items-center justify-between pb-4 border-b border-border-base dark:border-border-base-dark">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-text-primary dark:text-text-primary-dark" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Filtros</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary dark:hover:text-text-primary-dark"
            aria-label="Cerrar filtros"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Categoría */}
      <FilterSection title="Categoría">
        <div className="space-y-2">
          {categorias?.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoriaClick(cat.id)}
              className={cn(
                'w-full text-left px-2 py-1.5 rounded text-sm transition-colors',
                filtros.categoriaId === cat.id
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark',
              )}
            >
              {cat.nombre}
            </button>
          ))}
          {!categorias && (
            <div className="space-y-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-7 rounded bg-bg-hover dark:bg-bg-hover-dark animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </FilterSection>

      {/* Talla */}
      <FilterSection title="Talla">
        <div className="flex flex-wrap gap-2">
          {TALLAS.map((talla) => {
            const active = filtros.talla?.includes(talla)
            return (
              <button
                key={talla}
                type="button"
                onClick={() => handleTallaToggle(talla)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
                  active
                    ? 'bg-accent text-white border-accent'
                    : 'border-border-base dark:border-border-base-dark text-text-secondary dark:text-text-secondary-dark hover:border-accent hover:text-accent',
                )}
              >
                {talla}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORES.map(({ nombre, hex }) => {
            const active = filtros.color?.includes(nombre)
            return (
              <button
                key={nombre}
                type="button"
                onClick={() => handleColorToggle(nombre)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs border transition-colors',
                  active
                    ? 'border-accent bg-accent/10 text-accent font-medium'
                    : 'border-border-base dark:border-border-base-dark text-text-secondary dark:text-text-secondary-dark hover:border-accent',
                )}
                title={nombre}
              >
                <span
                  className="w-3 h-3 rounded-full border border-border-base dark:border-border-base-dark"
                  style={{ backgroundColor: hex }}
                  aria-hidden="true"
                />
                {nombre}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Precio */}
      <FilterSection title="Precio">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="200"
            placeholder="$0"
            value={filtros.precioMin || ''}
            onChange={(e) => handlePrecioMin(e.target.value)}
            className="w-full h-9 px-2 rounded-md text-sm border border-border-base dark:border-border-base-dark bg-bg-base dark:bg-bg-hover-dark text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Precio mínimo"
          />
          <span className="text-text-muted text-xs">—</span>
          <input
            type="number"
            min="0"
            max="200"
            placeholder="$200"
            value={filtros.precioMax || ''}
            onChange={(e) => handlePrecioMax(e.target.value)}
            className="w-full h-9 px-2 rounded-md text-sm border border-border-base dark:border-border-base-dark bg-bg-base dark:bg-bg-hover-dark text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Precio máximo"
          />
        </div>
      </FilterSection>

      {/* Clear filters */}
      {hasActiveFilters && (
        <div className="pt-4">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={clearFiltros}
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </aside>
  )
}
