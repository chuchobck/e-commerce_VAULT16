import rateLimit from 'express-rate-limit';

// ── Rate limit global: 100 req/min por IP ────────────────────────────────────
export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Demasiadas peticiones. Esperá un momento.' },
  },
});

// ── Rate limit estricto para login: 5 intentos / 15 min ──────────────────────
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Demasiados intentos de login. Esperá 15 minutos.' },
  },
});

// ── Rate limit del chat: 10 mensajes/min ─────────────────────────────────────
export const chatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT', message: 'Demasiados mensajes. Esperá un momento.' },
  },
});
