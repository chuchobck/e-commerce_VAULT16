import axios from 'axios'

const TOKEN_KEY = 'vault16_token'

// ⚠️  Convención de URLs:
//   `baseURL = VITE_API_URL` (por defecto `/api/v1`), por lo tanto cada
//   llamada DEBE usar rutas SIN el prefijo `/api/`. Ejemplos correctos:
//     api.get('/productos'), api.post('/auth/login'), api.get('/carrito').
//   NUNCA escribir `'/api/...'` en una llamada o el path se duplica a
//   `/api/v1/api/...` y devuelve 404.
const rawApiUrl = import.meta.env.VITE_API_URL?.trim() ?? '/api/v1'
let baseURL = rawApiUrl.replace(/\/+$|^\s+|\s+$/g, '')

if (baseURL.endsWith('/api')) {
  baseURL = `${baseURL}/v1`
} else if (!baseURL.match(/\/api(\/v1)?$/)) {
  baseURL = `${baseURL}/api/v1`
}

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Evita importar authStore directamente (circular dep). providers.tsx
// registra la función de logout al montar la app.
let _logoutHandler: (() => void) | null = null
export function registerLogoutHandler(fn: () => void) {
  _logoutHandler = fn
}

// ── Request: inyectar Bearer token ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response: manejar errores de autenticación ────────────────────────────

// Guard para evitar múltiples redirects simultáneos cuando varias
// peticiones en vuelo devuelven 401 al mismo tiempo.
let isRedirecting = false

// Rutas públicas que NO requieren autenticación — si el usuario está
// en alguna de estas, un 401 solo limpia el token pero no redirige.
const PUBLIC_PATH_PREFIXES = [
  '/', '/catalogo', '/categoria', '/producto', '/carrito',
  '/promociones', '/contacto', '/acerca', '/terminos', '/privacidad',
  '/login', '/register', '/forgot-password', '/reset-password', '/verify-email',
]

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Llama al logout del Zustand store (limpia token en memoria + localStorage
      // + persisted state de una sola vez). Si el handler aún no fue registrado,
      // cae al fallback manual para no dejar el token colgado.
      if (_logoutHandler) {
        _logoutHandler()
      } else {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('vault16_auth')
      }

      // Solo redirigir al login si estamos en una página protegida
      // y no hay ya un redirect en curso.
      const currentPath = window.location.pathname
      if (!isPublicPage(currentPath) && !isRedirecting) {
        isRedirecting = true
        const returnUrl = encodeURIComponent(currentPath + window.location.search)
        window.location.href = `/login?returnUrl=${returnUrl}`
      }
    }

    return Promise.reject(error)
  },
)

export { TOKEN_KEY }
