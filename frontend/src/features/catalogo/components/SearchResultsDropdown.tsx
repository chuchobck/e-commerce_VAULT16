import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight } from 'lucide-react'

interface SearchResult {
  id: number
  nombre: string
  precio: number
  categoria: string
  foto: string | null
}

interface SearchResultsDropdownProps {
  isOpen: boolean
  isLoading: boolean
  results: SearchResult[]
  totalResults: number
  query: string
  onClose: () => void
}

function ResultSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="w-10 h-12 rounded bg-bg-hover dark:bg-bg-hover-dark animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-3/4 bg-bg-hover dark:bg-bg-hover-dark animate-pulse rounded" />
        <div className="h-2.5 w-1/2 bg-bg-hover dark:bg-bg-hover-dark animate-pulse rounded" />
      </div>
    </div>
  )
}

export function SearchResultsDropdown({
  isOpen,
  isLoading,
  results,
  totalResults,
  query,
  onClose,
}: SearchResultsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Click outside to close
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 right-0 mt-1 z-dropdown bg-bg-surface dark:bg-bg-card-dark border border-border-base dark:border-border-base-dark rounded-lg shadow-modal dark:shadow-modal-dark overflow-hidden"
        >
          {isLoading ? (
            <div>
              <ResultSkeleton />
              <ResultSkeleton />
              <ResultSkeleton />
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center">
              <Search className="h-5 w-5 text-text-muted dark:text-text-muted-dark mx-auto mb-2" />
              <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                Sin resultados para "{query}"
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border-base dark:divide-border-base-dark">
                {results.map((r) => (
                  <Link
                    key={r.id}
                    to={`/producto/${r.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors"
                  >
                    <div className="w-10 h-12 rounded bg-bg-hover dark:bg-bg-hover-dark flex-shrink-0 overflow-hidden">
                      {r.foto ? (
                        <img src={r.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-text-muted">V16</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate">
                        {r.nombre}
                      </p>
                      <p className="text-xs text-text-muted dark:text-text-muted-dark">{r.categoria}</p>
                    </div>
                    <span className="text-sm font-medium text-accent tabular-nums">${r.precio.toFixed(2)}</span>
                  </Link>
                ))}
              </div>

              {totalResults > results.length && (
                <Link
                  to={`/catalogo?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-accent hover:bg-accent/5 border-t border-border-base dark:border-border-base-dark transition-colors"
                >
                  Ver todos los resultados ({totalResults})
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
