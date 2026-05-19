import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  // Tema
  isDark: boolean
  toggleDark: () => void

  // Carrito drawer
  cartDrawerOpen: boolean
  openCartDrawer:  () => void
  closeCartDrawer: () => void

  // Guía de tallas
  sizeGuideOpen:          boolean
  activeProductCategory:  'top' | 'pant' | null
  openSizeGuide:  (categoria: 'top' | 'pant') => void
  closeSizeGuide: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Tema
      isDark:     true,
      toggleDark: () => set((s) => ({ isDark: !s.isDark })),

      // Carrito drawer
      cartDrawerOpen:  false,
      openCartDrawer:  () => set({ cartDrawerOpen: true }),
      closeCartDrawer: () => set({ cartDrawerOpen: false }),

      // Guía de tallas
      sizeGuideOpen:         false,
      activeProductCategory: null,
      openSizeGuide: (categoria) =>
        set({ sizeGuideOpen: true, activeProductCategory: categoria }),
      closeSizeGuide: () =>
        set({ sizeGuideOpen: false, activeProductCategory: null }),
    }),
    {
      name:        'vault16_ui',
      partialize:  (state) => ({ isDark: state.isDark }),
    },
  ),
)
