import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TOKEN_KEY } from '@/shared/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Cliente {
  id: number
  rucCedula: string
  nombre1: string
  apellido1: string
  email: string
  telefono: string | null
  emailVerificado: boolean
}

interface AuthStore {
  cliente: Cliente | null
  token: string | null
  isAuthenticated: boolean

  // Kept for backward compat with UserMenu
  user: { id: string; email: string; nombre: string; apellido: string } | null

  login: (cliente: Cliente, token: string) => void
  logout: () => void
  updateProfile: (cambios: Partial<Cliente>) => void
  setAuth: (token: string, user: { id: string; email: string; nombre: string; apellido: string }) => void
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      cliente: null,
      token: null,
      isAuthenticated: false,
      user: null,

      login: (cliente, token) => {
        localStorage.setItem(TOKEN_KEY, token)
        set({
          cliente,
          token,
          isAuthenticated: true,
          user: {
            id: String(cliente.id),
            email: cliente.email,
            nombre: cliente.nombre1,
            apellido: cliente.apellido1,
          },
        })
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY)
        set({
          cliente: null,
          token: null,
          isAuthenticated: false,
          user: null,
        })
      },

      updateProfile: (cambios) => {
        const current = get().cliente
        if (!current) return
        const updated = { ...current, ...cambios }
        set({
          cliente: updated,
          user: {
            id: String(updated.id),
            email: updated.email,
            nombre: updated.nombre1,
            apellido: updated.apellido1,
          },
        })
      },

      // Legacy compat
      setAuth: (token, user) => {
        localStorage.setItem(TOKEN_KEY, token)
        set({
          token,
          user,
          isAuthenticated: true,
          cliente: {
            id: Number(user.id),
            rucCedula: '',
            nombre1: user.nombre,
            apellido1: user.apellido,
            email: user.email,
            telefono: null,
            emailVerificado: true,
          },
        })
      },
    }),
    {
      name: 'vault16_auth',
      partialize: (state) => ({
        cliente: state.cliente,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    },
  ),
)

