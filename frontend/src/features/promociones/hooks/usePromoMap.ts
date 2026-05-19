import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPromociones, type Promocion } from '@/features/promociones/api/promocionesApi'

/**
 * usePromoMap — devuelve un Map<id_producto, porcentaje_descuento> con el
 * máximo descuento VIGENTE aplicable a cada producto.
 *
 * Se usa en `ProductCard` y `ProductInfo` para mostrar precio tachado + badge
 * "-X%" en cualquier lugar donde se renderiza un producto, sin que cada página
 * tenga que pedir las promos por separado (React Query dedup + cache compartido).
 */
export function usePromoMap(): Map<string, number> {
  const { data } = useQuery<Promocion[]>({
    queryKey: ['promociones'],
    queryFn: getPromociones,
    staleTime: 5 * 60 * 1000,
  })

  return useMemo(() => {
    const map = new Map<string, number>()
    if (!data) return map
    for (const promo of data) {
      if (promo.estado !== 'VIGENTE' || promo.porcentaje <= 0) continue
      for (const p of promo.productos) {
        const previo = map.get(p.id) ?? 0
        if (promo.porcentaje > previo) map.set(p.id, promo.porcentaje)
      }
    }
    return map
  }, [data])
}
