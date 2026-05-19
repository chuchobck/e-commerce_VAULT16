import { useQuery } from '@tanstack/react-query'
import { getDestacados } from '@/features/home/api/homeApi'

export function useDestacados() {
  return useQuery({
    queryKey: ['productos', 'destacados'],
    queryFn: getDestacados,
  })
}
