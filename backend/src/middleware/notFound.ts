import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` },
  });
}
