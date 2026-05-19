import { useRef, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCantidad as apiUpdateCantidad } from '@/features/carrito/api/carritoApi'
import { useCarritoStore } from '@/features/carrito/stores/carritoStore'
import type { CarritoItemMapped } from '@/features/carrito/api/carritoApi'
import { useToast } from '@/shared/hooks/useToast'

/**
 * Mutation hook for updating item quantity with 400ms debounce.
 * Prevents spamming the API when user clicks +/- rapidly.
 */
export function useUpdateCantidad() {
  const queryClient = useQueryClient()
  const updateOptimistic = useCarritoStore((s) => s.updateCantidadOptimistic)
  const setItems = useCarritoStore((s) => s.setItems)
  const { error } = useToast()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isAuthenticated = !!localStorage.getItem('vault16_token')

  const mutation = useMutation({
    mutationFn: ({ itemId, cantidad }: { itemId: number; cantidad: number }) =>
      apiUpdateCantidad(itemId, cantidad),

    onSuccess: (data: CarritoItemMapped[]) => {
      setItems(data)
      queryClient.setQueryData(['carrito'], data)
    },

    onError: () => {
      error('No pudimos actualizar la cantidad')
      queryClient.invalidateQueries({ queryKey: ['carrito'] })
    },
  })

  const updateCantidad = useCallback(
    (varianteId: number, itemId: number, cantidad: number) => {
      // Optimistic update immediately
      updateOptimistic(varianteId, cantidad)

      if (!isAuthenticated || itemId === 0) return

      // Debounce the API call
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        mutation.mutate({ itemId, cantidad })
      }, 400)
    },
    [updateOptimistic, isAuthenticated, mutation],
  )

  return { updateCantidad, isUpdating: mutation.isPending }
}
