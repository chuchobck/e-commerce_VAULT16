import { useEffect, type ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { queryClient } from '@/shared/lib/queryClient'
import { useUIStore } from '@/shared/stores/uiStore'

function ThemeSync() {
  const isDark = useUIStore((s) => s.isDark)

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  return null
}

interface ProvidersProps {
  children: ReactNode
}

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test'

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PayPalScriptProvider
        options={{
          clientId: PAYPAL_CLIENT_ID,
          currency: 'USD',
          intent: 'capture',
          components: 'buttons',
        }}
        deferLoading={PAYPAL_CLIENT_ID === 'test'}
      >
        <BrowserRouter>
          <ThemeSync />
          {children}
        </BrowserRouter>
      </PayPalScriptProvider>
    </QueryClientProvider>
  )
}
