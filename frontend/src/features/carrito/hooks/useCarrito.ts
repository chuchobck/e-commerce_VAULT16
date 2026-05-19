import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCarrito } from '@/features/carrito/api/carritoApi'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'

/**
 * Sync carrito from backend when authenticated.
 * For unauthenticated users, only the local Zustand store is used.
 */
export function useCarrito() {
  const setItems = useCarritoStore((s) => s.setItems)
  const setLoading = useCarritoStore((s) => s.setLoading)

  // Check if token exists (lightweight check — no auth store dependency)
  const isAuthenticated = !!localStorage.getItem('vault16_token')

  const query = useQuery({
    queryKey: ['carrito'],
    queryFn: async () => {
      setLoading(true)
      try {
        const items = await getCarrito()
        return items
      } finally {
        setLoading(false)
      }
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (query.data) setItems(query.data)
  }, [query.data, setItems])

  return query
}
