import axios from 'axios'

const TOKEN_KEY = 'vault16_token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: inyectar Bearer token ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response: manejar errores de autenticación ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const code   = error.response?.data?.error?.code

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?returnUrl=${returnUrl}`
    }

    if (status === 403 && code === 'EMAIL_NOT_VERIFIED') {
      window.location.href = '/verify-email-pending'
    }

    return Promise.reject(error)
  },
)

export { TOKEN_KEY }
