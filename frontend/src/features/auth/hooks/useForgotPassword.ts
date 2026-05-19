import { useMutation } from '@tanstack/react-query'
import { forgotPassword } from '@/features/auth/api/authApi'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  })
}
