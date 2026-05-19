import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clearCarrito as apiClearCarrito } from '@/features/carrito/api/carritoApi'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'
import { useToast } from '@/shared/hooks/useToast'

/**
 * Hook to clear the cart.
 * - Authenticated: calls DELETE /carrito and syncs store with backend
 * - Guest: just wipes local store
 */
export function useClearCarrito() {
  const queryClient = useQueryClient()
  const setItems = useCarritoStore((s) => s.setItems)
  const clearLocal = useCarritoStore((s) => s.clearOptimistic)
  const { error } = useToast()

  const isAuthenticated = !!localStorage.getItem('vault16_token')

  const mutation = useMutation({
    mutationFn: () => apiClearCarrito(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['carrito'] })
      const prevStore = useCarritoStore.getState().items
      clearLocal()
      return { prevStore }
    },
    onSuccess: (data) => {
      setItems(data)
      queryClient.setQueryData(['carrito'], data)
    },
    onError: (_err, _vars, context) => {
      if (context?.prevStore) setItems(context.prevStore)
      queryClient.invalidateQueries({ queryKey: ['carrito'] })
      error('No pudimos vaciar el carrito')
    },
  })

  const clear = useCallback(() => {
    if (isAuthenticated) {
      mutation.mutate()
    } else {
      clearLocal()
    }
  }, [isAuthenticated, mutation, clearLocal])

  return { clear, isClearing: mutation.isPending }
}
