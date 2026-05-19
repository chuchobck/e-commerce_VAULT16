import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeItem as apiRemoveItem } from '@/features/carrito/api/carritoApi'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'
import { useToast } from '@/shared/hooks/useToast'

/**
 * Mutation hook for removing a cart item.
 * Optimistic: removes from store immediately, then confirms with API.
 */
export function useRemoveItem() {
  const queryClient = useQueryClient()
  const removeOptimistic = useCarritoStore((s) => s.removeItemOptimistic)
  const { error } = useToast()

  const isAuthenticated = !!localStorage.getItem('vault16_token')

  const mutation = useMutation({
    mutationFn: (itemId: number) => apiRemoveItem(itemId),

    onError: () => {
      error('No pudimos eliminar el producto')
      queryClient.invalidateQueries({ queryKey: ['carrito'] })
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['carrito'] })
    },
  })

  const remove = useCallback(
    (varianteId: number, itemId: number) => {
      // Optimistic: remove immediately
      removeOptimistic(varianteId)

      if (isAuthenticated && itemId > 0) {
        mutation.mutate(itemId)
      }
    },
    [removeOptimistic, isAuthenticated, mutation],
  )

  return { remove, isRemoving: mutation.isPending }
}
