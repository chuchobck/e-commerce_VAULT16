import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addItem as apiAddItem } from '@/features/carrito/api/carritoApi'
import { useCarritoStore, type CarritoItem } from '@/features/carrito/stores/carritoStore'
import type { CarritoItemMapped } from '@/features/carrito/api/carritoApi'
import { useUIStore } from '@/shared/stores/uiStore'
import { useToast } from '@/shared/hooks/useToast'
import type { Producto, Variante } from '@/shared/types/producto.types'

/**
 * Mutation hook for adding items to the cart.
 * - Authenticated: calls API with optimistic updates
 * - Guest: adds directly to the Zustand local store
 */
export function useAddToCarrito() {
  const queryClient = useQueryClient()
  const addItemOptimistic = useCarritoStore((s) => s.addItemOptimistic)
  const setItems = useCarritoStore((s) => s.setItems)
  const openCartDrawer = useUIStore((s) => s.openCartDrawer)
  const { success, error } = useToast()

  const isAuthenticated = !!localStorage.getItem('vault16_token')

  const mutation = useMutation({
    mutationFn: (payload: { id_variante: number; cantidad: number }) =>
      apiAddItem(payload),

    onMutate: async (_payload) => {
      await queryClient.cancelQueries({ queryKey: ['carrito'] })
      const prev = queryClient.getQueryData<CarritoItemMapped[]>(['carrito'])
      const prevStore = useCarritoStore.getState().items
      return { prev, prevStore }
    },

    onError: (_err, _payload, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['carrito'], context.prev)
      }
      // Rollback Zustand store so phantom items don't stay in the drawer
      if (context?.prevStore) {
        setItems(context.prevStore)
      }
      // Re-sync from backend just in case (cheap GET /carrito)
      queryClient.invalidateQueries({ queryKey: ['carrito'] })
      error('No pudimos agregar el producto')
    },

    onSuccess: (data: CarritoItemMapped[]) => {
      // Sync store + react-query cache with real backend IDs
      setItems(data)
      queryClient.setQueryData(['carrito'], data)
      openCartDrawer()
      success('¡Agregado al carrito!')
    },
  })

  /**
   * Add a product variant to the cart.
   * Works for both authenticated and guest users.
   */
  const agregar = useCallback(
    (producto: Producto, variante: Variante, cantidad: number) => {
      const mainFoto =
        producto.fotos.find((f) => f.esPrincipal) || producto.fotos[0]
      const descuentoPct = producto.porcentajeDescuentoActivo ?? 0
      const precioOriginal = producto.precio
      const precio = descuentoPct > 0
        ? precioOriginal * (1 - descuentoPct / 100)
        : precioOriginal

      const item: CarritoItem = {
        id: 0, // local-only until backend confirms
        varianteId: variante.id,
        productoId: producto.id,
        nombre: producto.nombre,
        slug: producto.slug,
        talla: variante.talla.nombre,
        color: variante.color,
        codigoHex: variante.codigoHex || '#4A535A',
        precio,
        precioOriginal,
        descuento: precioOriginal - precio,
        cantidad,
        stock: variante.stock,
        imagen: mainFoto?.url || '',
      }

      // Optimistic update the store immediately
      addItemOptimistic(item)

      if (isAuthenticated) {
        // Fire API mutation
        mutation.mutate({ id_variante: variante.id, cantidad })
      } else {
        // Guest: just update local store + open drawer
        openCartDrawer()
        success('¡Agregado al carrito!')
      }
    },
    [addItemOptimistic, isAuthenticated, mutation, openCartDrawer, success],
  )

  return {
    agregar,
    isAdding: mutation.isPending,
  }
}
