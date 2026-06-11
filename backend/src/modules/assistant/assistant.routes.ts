import { Router, Request, Response, NextFunction } from 'express';
import { authCliente } from '../../middleware/authCliente';
import { authBackoffice } from '../../middleware/authBackoffice';
import { requireRole } from '../../middleware/requireRole';
import { chatRateLimit } from '../../middleware/rateLimit';
import { verifyToken } from '../../shared/utils/jwt';
import * as controller from './assistant.controller';

// ─── Middleware de auth opcional para clientes ────────────────────────────────

function optionalAuthCliente(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.cliente = verifyToken(header.slice(7), 'cliente');
    } catch {
      // token inválido → continúa como anónimo
    }
  }
  next();
}

// ─── Router del asistente ────────────────────────────────────────────────────

export const assistantRouter = Router();

// POST /api/assistant/chat (SSE, auth opcional)
assistantRouter.post('/chat', chatRateLimit, optionalAuthCliente, controller.chat);

// POST /api/assistant/chat-sync (JSON fallback, auth opcional)
assistantRouter.post('/chat-sync', chatRateLimit, optionalAuthCliente, controller.chatSync);

// GET /api/assistant/sesiones → cliente logueado
assistantRouter.get('/sesiones', authCliente, controller.getSesiones);

// GET /api/assistant/sesiones/:id → cliente o backoffice admin
assistantRouter.get(
  '/sesiones/:id',
  (req: Request, res: Response, next: NextFunction) => {
    // Intentar autenticar como cliente primero; si falla, intentar backoffice
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return authCliente(req, res, next); // fallará con 401
    }
    try {
      req.cliente = verifyToken(header.slice(7), 'cliente');
      return next();
    } catch {
      try {
        req.user = verifyToken(header.slice(7), 'backoffice');
        return next();
      } catch {
        return authCliente(req, res, next); // fallará con 401 apropiado
      }
    }
  },
  controller.getSesionById,
);

// ─── Router admin (se monta en /api/admin) ───────────────────────────────────

export const adminAssistantRouter = Router();

// GET /api/admin/sesiones → admin
adminAssistantRouter.get(
  '/sesiones',
  authBackoffice,
  requireRole('ADMIN'),
  controller.getSesionesAdmin,
);
