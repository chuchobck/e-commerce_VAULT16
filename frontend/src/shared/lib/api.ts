import axios from 'axios'

const TOKEN_KEY = 'vault16_token'

// ⚠️  Convención de URLs:
//   `baseURL = VITE_API_URL` (por defecto `/api/v1`), por lo tanto cada
//   llamada DEBE usar rutas SIN el prefijo `/api/`. Ejemplos correctos:
//     api.get('/productos'), api.post('/auth/login'), api.get('/carrito').
//   NUNCA escribir `'/api/...'` en una llamada o el path se duplica a
//   `/api/v1/api/...` y devuelve 404.
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

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?returnUrl=${returnUrl}`
    }

    // Nota: el bloqueo por EMAIL_NOT_VERIFIED fue removido en el backend.
    // Si por algún motivo vuelve un 403 con ese code, dejamos que la UI
    // del endpoint correspondiente lo muestre como error normal, sin redirigir.

    return Promise.reject(error)
  },
)

export { TOKEN_KEY }
