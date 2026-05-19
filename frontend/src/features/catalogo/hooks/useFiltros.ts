import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface Filtros {
  search?: string
  categoriaId?: number
  talla?: string[]
  color?: string[]
  precioMin?: number
  precioMax?: number
  sort?: string
}

/**
 * useFiltros — reads/writes catalog filters from URL search params.
 * All filter state lives in the URL → shareable, bookmarkable.
 */
export function useFiltros() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filtros: Filtros = useMemo(() => {
    const search = searchParams.get('q') || searchParams.get('search') || undefined
    const categoriaId = searchParams.get('categoriaId')
      ? Number(searchParams.get('categoriaId'))
      : undefined
    const talla = searchParams.get('talla')?.split(',').filter(Boolean) || undefined
    const color = searchParams.get('color')?.split(',').filter(Boolean) || undefined
    const precioMin = searchParams.get('precioMin')
      ? Number(searchParams.get('precioMin'))
      : undefined
    const precioMax = searchParams.get('precioMax')
      ? Number(searchParams.get('precioMax'))
      : undefined
    const sort = searchParams.get('sort') || undefined

    return { search, categoriaId, talla, color, precioMin, precioMax, sort }
  }, [searchParams])

  const setFiltro = useCallback(
    (key: string, value: string | string[] | number | undefined) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
            next.delete(key)
          } else if (Array.isArray(value)) {
            next.set(key, value.join(','))
          } else {
            next.set(key, String(value))
          }
          // Reset to page 1 on filter change
          next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const clearFiltros = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const hasActiveFilters = useMemo(() => {
    return !!(
      filtros.search ||
      filtros.categoriaId ||
      (filtros.talla && filtros.talla.length > 0) ||
      (filtros.color && filtros.color.length > 0) ||
      filtros.precioMin ||
      filtros.precioMax ||
      filtros.sort
    )
  }, [filtros])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filtros.search) count++
    if (filtros.categoriaId) count++
    if (filtros.talla && filtros.talla.length > 0) count++
    if (filtros.color && filtros.color.length > 0) count++
    if (filtros.precioMin || filtros.precioMax) count++
    if (filtros.sort) count++
    return count
  }, [filtros])

  return { filtros, setFiltro, clearFiltros, hasActiveFilters, activeFilterCount }
}
