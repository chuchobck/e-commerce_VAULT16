import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { iniciarPago, type IniciarPagoResponse } from '@/features/checkout/api/checkoutApi'

/**
 * Creates a payment intent via backend.
 * Caches the result to prevent duplicate intents on re-renders.
 */
export function useCreatePaymentIntent() {
  const cachedRef = useRef<IniciarPagoResponse | null>(null)

  const mutation = useMutation({
    mutationFn: async (payload: {
      direccionId: number
      metodoPago: 'TARJETA' | 'TRANSFERENCIA'
    }) => {
      // Return cached if same params
      if (
        cachedRef.current &&
        cachedRef.current.metodo === payload.metodoPago
      ) {
        return cachedRef.current
      }
      const result = await iniciarPago(payload)
      cachedRef.current = result
      return result
    },
  })

  const reset = () => {
    cachedRef.current = null
    mutation.reset()
  }

  return {
    createIntent: mutation.mutate,
    createIntentAsync: mutation.mutateAsync,
    data: mutation.data,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset,
  }
}
