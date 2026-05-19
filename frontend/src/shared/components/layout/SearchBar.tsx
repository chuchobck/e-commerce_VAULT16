import { useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useSearch } from '@/features/catalogo/hooks/useSearch'
import { SearchResultsDropdown } from '@/features/catalogo/components/SearchResultsDropdown'
import { useState, useCallback } from 'react'

/**
 * SearchBar con debounce 400ms + dropdown de sugerencias.
 * - En desktop: siempre visible, expandida en el centro del header.
 * - En mobile: colapsa a icono, se expande al click.
 * - Al typear → debounce 400ms → muestra dropdown con top 5 resultados
 * - Al Enter → navega a /catalogo?q=...
 */
export function SearchBar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  const { query, setQuery, results, totalResults, isLoading, isOpen, close } = useSearch()

  // Sync from URL on mount
  useEffect(() => {
    const urlQ = searchParams.get('q')
    if (urlQ) setQuery(urlQ)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keyboard shortcut: / focuses search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
        setMobileOpen(true)
      }
      if (e.key === 'Escape') {
        close()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [close])

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value)
    },
    [setQuery],
  )

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

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => {
      if (!prev) {
        setTimeout(() => mobileInputRef.current?.focus(), 100)
      }
      return !prev
    })
  }, [])

  return (
    <>
      {/* Desktop search — always visible */}
      <form
        onSubmit={handleSubmit}
        className="hidden sm:flex flex-1 max-w-prose mx-6"
        role="search"
      >
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

          {/* Dropdown */}
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

      {/* Mobile search toggle */}
      <button
        type="button"
        onClick={toggleMobile}
        className="sm:hidden p-2 rounded-md text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-bg-hover dark:hover:bg-bg-hover-dark transition-colors"
        aria-label="Abrir búsqueda"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Mobile search expanded overlay */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-x-0 top-0 z-sticky bg-bg-surface dark:bg-bg-surface-dark p-3 shadow-modal dark:shadow-modal-dark">
          <div className="flex items-center gap-2">
            <form onSubmit={handleSubmit} className="flex-1 relative" role="search">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted dark:text-text-muted-dark pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={mobileInputRef}
                type="search"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Buscá hoodies, tees, pants..."
                className={cn(
                  'w-full h-10 pl-10 pr-4 rounded-md text-sm',
                  'bg-bg-hover dark:bg-bg-hover-dark',
                  'border border-border-base dark:border-border-base-dark',
                  'text-text-primary dark:text-text-primary-dark',
                  'placeholder:text-text-muted dark:placeholder:text-text-muted-dark',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
                )}
                aria-label="Buscar productos"
                autoComplete="off"
              />

              <SearchResultsDropdown
                isOpen={isOpen}
                isLoading={isLoading}
                results={results}
                totalResults={totalResults}
                query={query}
                onClose={close}
              />
            </form>
            <button
              type="button"
              onClick={() => { setMobileOpen(false); close() }}
              className="p-2 rounded-md text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark"
              aria-label="Cerrar búsqueda"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
