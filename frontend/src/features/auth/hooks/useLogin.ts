import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { loginCliente } from '@/features/auth/api/authApi'
import { useAuthStore } from '@/shared/stores/authStore'
import { useToast } from '@/shared/hooks/useToast'
import type { LoginInput } from '@/features/auth/schemas/auth.schemas'

export function useLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (data: LoginInput) => loginCliente(data),
    onSuccess: (res) => {
      login(res.cliente, res.token)
      success('¡Bienvenido de nuevo!')

      const returnUrl = searchParams.get('returnUrl') || '/'
      navigate(returnUrl)
    },
    onError: (err: any) => {
      // Nota: ya no bloqueamos el login por EMAIL_NOT_VERIFIED. La rama
      // especial fue removida; mostramos el mensaje del backend o un genérico.
      const msg = err?.response?.data?.error?.message
      error(msg || 'Credenciales incorrectas')
    },
  })
}
