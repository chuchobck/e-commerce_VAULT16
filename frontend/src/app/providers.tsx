import { useEffect, type ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
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

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeSync />
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}
