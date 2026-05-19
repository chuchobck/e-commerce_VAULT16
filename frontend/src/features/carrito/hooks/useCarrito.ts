import { useQuery } from '@tanstack/react-query'
import { getCarrito } from '@/features/carrito/api/carritoApi'
import { useCarritoStore, type CarritoItem } from '@/features/carrito/stores/carritoStore'

/**
 * Sync carrito from backend when authenticated.
 * For unauthenticated users, only the local Zustand store is used.
 */
export function useCarrito() {
  const setItems = useCarritoStore((s) => s.setItems)
  const setLoading = useCarritoStore((s) => s.setLoading)

  // Check if token exists (lightweight check — no auth store dependency)
  const isAuthenticated = !!localStorage.getItem('vault16_token')

  return useQuery({
    queryKey: ['carrito'],
    queryFn: async () => {
      setLoading(true)
      try {
        const data = await getCarrito()
        const items: CarritoItem[] = data.items.map((item) => {
          const mainFoto =
            item.variante.producto.fotos.find((f) => f.esPrincipal) ||
            item.variante.producto.fotos[0]
          const descuentoPct = item.variante.producto.porcentajeDescuentoActivo ?? 0
          const precioOriginal = item.precioUnitario
          const precio = descuentoPct > 0
            ? precioOriginal * (1 - descuentoPct / 100)
            : precioOriginal

          return {
            id: item.id,
            varianteId: item.variante.id,
            productoId: item.variante.productoId,
            nombre: item.variante.producto.nombre,
            slug: item.variante.producto.slug,
            talla: item.variante.talla.nombre,
            color: item.variante.color,
            codigoHex: item.variante.codigoHex,
            precio,
            precioOriginal,
            descuento: precioOriginal - precio,
            cantidad: item.cantidad,
            stock: item.variante.stock,
            imagen: mainFoto?.url || '',
          }
        })
        setItems(items)
        return items
      } finally {
        setLoading(false)
      }
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}
