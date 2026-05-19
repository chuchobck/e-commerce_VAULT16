import { useState } from 'react'

export type MetodoPagoUI = 'PAYPAL' | 'TARJETA' | 'TRANSFERENCIA'

interface UseCheckoutReturn {
  direccionId: number | null
  metodoPago: MetodoPagoUI | null
  idFactura: string | null
  setDireccion: (id: number | null) => void
  setMetodoPago: (m: MetodoPagoUI) => void
  setIdFactura: (id: string) => void
}

export function useCheckout(): UseCheckoutReturn {
  const [direccionId, setDireccionId] = useState<number | null>(null)
  const [metodoPago, setMetodo] = useState<MetodoPagoUI | null>(null)
  const [idFactura, setIdFact] = useState<string | null>(null)

  return {
    direccionId,
    metodoPago,
    idFactura,
    setDireccion: setDireccionId,
    setMetodoPago: setMetodo,
    setIdFactura: setIdFact,
  }
}
