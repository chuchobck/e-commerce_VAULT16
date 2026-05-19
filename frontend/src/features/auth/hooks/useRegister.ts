import { useMutation } from '@tanstack/react-query'
import { registerCliente } from '@/features/auth/api/authApi'
import { useToast } from '@/shared/hooks/useToast'
import type { RegisterInput } from '@/features/auth/schemas/auth.schemas'

export function useRegister() {
  const { error } = useToast()

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
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message
      error(msg || 'No pudimos crear tu cuenta')
    },
  })
}
