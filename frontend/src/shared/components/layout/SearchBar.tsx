import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useSearch } from '@/features/catalogo/hooks/useSearch'
import { SearchResultsDropdown } from '@/features/catalogo/components/SearchResultsDropdown'

/**
 * SearchBar con debounce 400ms + dropdown de sugerencias.
 *
 * Input siempre visible (sin overlay mobile). El Header se encarga de
 * posicionarlo:
 *  - desktop (sm+): centrado en row 1 del grid con max-w 520px.
 *  - mobile (< sm): persistente en una segunda fila debajo del logo + íconos.
 *
 * Atajo `/` enfoca el input. Enter navega a /catalogo?q=...
 */
export function SearchBar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const { query, setQuery, results, totalResults, isLoading, isOpen, close } = useSearch()

  // Evita doble query/dropdown si el componente se monta dos veces (mobile + desktop).
  // Solo la primera instancia escucha el atajo `/` y sincroniza con la URL.
  const [isPrimary] = useState(() => {
    if (typeof window === 'undefined') return true
    const w = window as typeof window & { __vault16_searchbar_primary?: boolean }
    if (w.__vault16_searchbar_primary) return false
    w.__vault16_searchbar_primary = true
    return true
  })
  useEffect(() => {
    return () => {
      if (!isPrimary) return
      const w = window as typeof window & { __vault16_searchbar_primary?: boolean }
      delete w.__vault16_searchbar_primary
    }
  }, [isPrimary])

  // Sync from URL on mount (solo instancia primaria)
  useEffect(() => {
    if (!isPrimary) return
    const urlQ = searchParams.get('q')
    if (urlQ) setQuery(urlQ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Atajo `/` enfoca el input (solo instancia primaria)
  useEffect(() => {
    if (!isPrimary) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [close, isPrimary])

  const handleChange = useCallback((value: string) => setQuery(value), [setQuery])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        navigate(`/catalogo?q=${encodeURIComponent(query.trim())}`)
        inputRef.current?.blur()
        close()
      }
    },
    [query, navigate, close],
  )

  const handleClear = useCallback(() => {
    setQuery('')
    close()
    inputRef.current?.focus()
  }, [setQuery, close])

  return (
    <form onSubmit={handleSubmit} className="flex w-full" role="search">
      <div className="relative w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted dark:text-text-muted-dark pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Buscá hoodies, tees, pants..."
          className={cn(
            'w-full h-10 pl-10 pr-10 rounded-md text-sm',
            'bg-bg-hover dark:bg-bg-hover-dark',
            'border border-border-base dark:border-border-base-dark',
            'text-text-primary dark:text-text-primary-dark',
            'placeholder:text-text-muted dark:placeholder:text-text-muted-dark',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
            'transition-colors duration-fast',
          )}
          aria-label="Buscar productos"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <SearchResultsDropdown
          isOpen={isOpen}
          isLoading={isLoading}
          results={results}
          totalResults={totalResults}
          query={query}
          onClose={close}
        />
      </div>
    </form>
  )
}
