import { Request, Response, NextFunction } from 'express';
import * as service from './assistant.service';
import { ChatMensajeSchema, ListSesionesQuerySchema } from './assistant.schemas';
import { BadRequestError } from '../../shared/utils/errors';

// ─── POST /api/assistant/chat (SSE) ──────────────────────────────────────────

export async function chat(req: Request, res: Response, next: NextFunction) {
  // Validar body manualmente (no usamos validateRequest porque SSE necesita
  // los headers SSE seteados antes de tirar cualquier error de negocio)
  const parsed = ChatMensajeSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(new BadRequestError(parsed.error.errors[0]?.message ?? 'Datos inválidos'));
  }
  const { mensaje, id_sesion } = parsed.data;

  // Setear headers SSE antes de cualquier await
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const idCliente = req.cliente?.id;
    const ip = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const idSesionFinal = await service.crearORecuperarSesion(
      id_sesion,
      idCliente,
      ip,
      userAgent,
    );

    await service.responderAsistente(idSesionFinal, mensaje, res);
  } catch (err) {
    // Si ya se enviaron headers SSE, escribimos el error como evento y cerramos
    if (res.headersSent) {
      const msg = err instanceof Error ? err.message : 'Error interno';
      res.write(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`);
      res.end();
    } else {
      next(err);
    }
  }
}

// ─── POST /api/assistant/chat-sync ───────────────────────────────────────────

export async function chatSync(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = ChatMensajeSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0]?.message ?? 'Datos inválidos');
    }
    const { mensaje, id_sesion } = parsed.data;

    const idCliente = req.cliente?.id;
    const ip = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const idSesionFinal = await service.crearORecuperarSesion(
      id_sesion,
      idCliente,
      ip,
      userAgent,
    );

    const result = await service.responderAsistenteSincrono(idSesionFinal, mensaje);

    res.json({ success: true, data: { id_sesion: idSesionFinal, ...result } });
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/assistant/sesiones (cliente logueado) ───────────────────────────

export async function getSesiones(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getSesionesCliente(req.cliente!.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/assistant/sesiones/:id (cliente o admin) ───────────────────────

export async function getSesionById(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente?.id; // undefined si es backoffice
    const data = await service.getSesionDetalle(req.params.id, idCliente);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/admin/sesiones (admin) ─────────────────────────────────────────

export async function getSesionesAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ListSesionesQuerySchema.parse(req.query);
    const { data, meta } = await service.getSesionesAdmin(query);
    res.json({ success: true, data, meta });
  } catch (error) {
    next(error);
  }
}
