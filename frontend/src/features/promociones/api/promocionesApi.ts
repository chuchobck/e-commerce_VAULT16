import { api } from '@/shared/lib/api'
import { mapPromocion, type PromocionMapped, type RawPromocion } from '@/shared/lib/mappers'

export type Promocion = PromocionMapped

export async function getPromociones(): Promise<Promocion[]> {
  const res = await api.get<{ success: boolean; data: RawPromocion[] }>('/promociones')
  return (res.data.data ?? []).map(mapPromocion)
}
