import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { registerCliente } from '@/features/auth/api/authApi'
import { useAuthStore } from '@/shared/stores/authStore'
import { useToast } from '@/shared/hooks/useToast'
import type { RegisterInput } from '@/features/auth/schemas/auth.schemas'

export function useRegister() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (data: RegisterInput) =>
      registerCliente({
        email: data.email,
        password: data.password,
        rucCedula: data.rucCedula,
        nombre1: data.nombre1,
        apellido1: data.apellido1,
        telefono: data.telefono || undefined,
      }),
    onSuccess: (res) => {
      // Auto-login: dejá al usuario adentro y mandalo a donde quería ir
      // (carrito → checkout) sin pasar por /login otra vez.
      login(res.cliente, res.token)
      success('¡Bienvenido a VAULT 16!')
      const returnUrl = searchParams.get('returnUrl') || '/'
      navigate(returnUrl)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message
      error(msg || 'No pudimos crear tu cuenta')
    },
  })
}
