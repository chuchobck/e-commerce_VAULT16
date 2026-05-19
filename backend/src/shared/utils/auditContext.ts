import { Request } from 'express';

export interface AuditContext {
  id_usuario_bo: number | null;
  id_cliente: number | null;
  ip: string | undefined;
  user_agent: string | undefined;
}

/**
 * Extrae el contexto de auditoría desde el request.
 * Centraliza el acceso a req.user, req.cliente, IP y user-agent.
 */
export function getAuditContext(req: Request): AuditContext {
  return {
    id_usuario_bo: req.user?.id ?? null,
    id_cliente: req.cliente?.id ?? null,
    ip: (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
      ?? req.socket.remoteAddress,
    user_agent: req.headers['user-agent'],
  };
}
