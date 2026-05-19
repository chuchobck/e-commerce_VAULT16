import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CarritoItem {
  /** Backend carrito_detalle ID (0 for local-only items) */
  id: number
  varianteId: number
  productoId: number
  nombre: string
  slug: string
  talla: string
  color: string
  codigoHex: string
  precio: number
  precioOriginal: number
  descuento: number
  cantidad: number
  stock: number
  imagen: string
}

interface CarritoStore {
  items: CarritoItem[]
  isLoading: boolean

  // Backend sync
  setItems: (items: CarritoItem[]) => void
  setLoading: (loading: boolean) => void

  // Optimistic updates
  addItemOptimistic: (item: CarritoItem) => void
  updateCantidadOptimistic: (varianteId: number, cantidad: number) => void
  removeItemOptimistic: (varianteId: number) => void
  clearOptimistic: () => void

  // Computed getters (as methods for Zustand)
  getTotalItems: () => number
  getSubtotal: () => number
  getDescuentoTotal: () => number
  getTotal: () => number
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useCarritoStore = create<CarritoStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      setItems: (items) => set({ items }),
      setLoading: (isLoading) => set({ isLoading }),

      addItemOptimistic: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.varianteId === item.varianteId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.varianteId === item.varianteId
                  ? { ...i, cantidad: i.cantidad + item.cantidad }
                  : i,
              ),
            }
          }
          return { items: [...state.items, item] }
        }),

      updateCantidadOptimistic: (varianteId, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.varianteId === varianteId ? { ...i, cantidad } : i,
          ),
        })),

      removeItemOptimistic: (varianteId) =>
        set((state) => ({
          items: state.items.filter((i) => i.varianteId !== varianteId),
        })),

      clearOptimistic: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((sum, i) => sum + i.cantidad, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.precioOriginal * i.cantidad, 0),

      getDescuentoTotal: () =>
        get().items.reduce((sum, i) => sum + i.descuento * i.cantidad, 0),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.precio * i.cantidad, 0),
    }),
    {
      name: 'vault16_carrito',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
