import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../shared/utils/errors';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos inválidos',
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  console.error('[ErrorHandler]', err);

  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  });
}
