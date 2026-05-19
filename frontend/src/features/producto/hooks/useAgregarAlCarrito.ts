import { useState, useCallback } from 'react'
import { useAddToCarrito } from '@/features/carrito/hooks/useAddToCarrito'
import type { Producto, Variante } from '@/shared/types/producto.types'

/**
 * Hook to handle adding a product variant to the cart.
 * Wraps the carrito feature's useAddToCarrito with UI animation state.
 */
export function useAgregarAlCarrito() {
  const { agregar: addToCart, isAdding } = useAddToCarrito()
  const [showSuccess, setShowSuccess] = useState(false)

  const agregar = useCallback(
    (producto: Producto, variante: Variante, cantidad: number) => {
      addToCart(producto, variante, cantidad)

      // Show success animation on the button
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    },
    [addToCart],
  )

  return { agregar, isAdding, showSuccess }
}

