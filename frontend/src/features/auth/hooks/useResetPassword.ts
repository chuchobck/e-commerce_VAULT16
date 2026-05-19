import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { resetPassword } from '@/features/auth/api/authApi'
import { useToast } from '@/shared/hooks/useToast'

export function useResetPassword() {
  const navigate = useNavigate()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (payload: { token: string; password: string }) =>
      resetPassword(payload),
    onSuccess: () => {
      success('Contraseña actualizada correctamente')
      navigate('/login')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message
      error(msg || 'No pudimos actualizar tu contraseña')
    },
  })
}
