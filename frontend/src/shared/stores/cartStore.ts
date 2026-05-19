import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  productoId: string
  varianteId: string
  nombre: string
  talla: string
  color: string
  precio: number
  cantidad: number
  imagen: string
}

interface CartStore {
  items: CartItem[]
  totalItems: number

  addItem: (item: CartItem) => void
  removeItem: (varianteId: string) => void
  updateQuantity: (varianteId: string, cantidad: number) => void
  clearCart: () => void
}

function calcTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.cantidad, 0)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.varianteId === newItem.varianteId,
          )
          let items: CartItem[]
          if (existing) {
            items = state.items.map((i) =>
              i.varianteId === newItem.varianteId
                ? { ...i, cantidad: i.cantidad + newItem.cantidad }
                : i,
            )
          } else {
            items = [...state.items, newItem]
          }
          return { items, totalItems: calcTotalItems(items) }
        }),

      removeItem: (varianteId) =>
        set((state) => {
          const items = state.items.filter((i) => i.varianteId !== varianteId)
          return { items, totalItems: calcTotalItems(items) }
        }),

      updateQuantity: (varianteId, cantidad) =>
        set((state) => {
          const items = state.items.map((i) =>
            i.varianteId === varianteId ? { ...i, cantidad } : i,
          )
          return { items, totalItems: calcTotalItems(items) }
        }),

      clearCart: () => set({ items: [], totalItems: 0 }),
    }),
    {
      name: 'vault16_cart',
    },
  ),
)
