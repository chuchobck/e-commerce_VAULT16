import { useMutation } from '@tanstack/react-query'
import { verifyEmail } from '@/features/auth/api/authApi'
import { useToast } from '@/shared/hooks/useToast'

export function useVerifyEmail() {
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: () => {
      success('¡Email verificado correctamente!')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message
      error(msg || 'No pudimos verificar tu email')
    },
  })
}
