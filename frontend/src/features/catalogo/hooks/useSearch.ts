import { useState, useCallback, useRef, useEffect } from 'react'
import { fetchProductos } from '@/features/catalogo/api/catalogoApi'
import type { Producto } from '@/shared/types/producto.types'

interface SearchResult {
  id: number
  nombre: string
  precio: number
  categoria: string
  foto: string | null
}

interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: SearchResult[]
  totalResults: number
  isLoading: boolean
  isOpen: boolean
  close: () => void
}

const MIN_CHARS = 3
const DEBOUNCE_MS = 400
const MAX_SUGGESTIONS = 5

export function useSearch(): UseSearchReturn {
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const setQuery = useCallback((q: string) => {
    setQueryState(q)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (q.trim().length < MIN_CHARS) {
      setResults([])
      setTotalResults(0)
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    setIsOpen(true)

    debounceRef.current = setTimeout(async () => {
      // Cancel previous request
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()

      try {
        const data = await fetchProductos({
          search: q.trim(),
          limit: MAX_SUGGESTIONS,
          page: 1,
        })

        const mapped: SearchResult[] = data.items.map((p: Producto) => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          categoria: p.categoria?.nombre || '',
          foto: p.fotos?.[0]?.url || null,
        }))

        setResults(mapped)
        setTotalResults(data.meta.total)
        setIsOpen(true)
      } catch {
        // Aborted or failed — ignore
      } finally {
        setIsLoading(false)
      }
    }, DEBOUNCE_MS)
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  return { query, setQuery, results, totalResults, isLoading, isOpen, close }
}
