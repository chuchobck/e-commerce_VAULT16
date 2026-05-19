import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      containerClassName="z-toast"
      toastOptions={{ duration: 4000 }}
    />
  )
}
