import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../shared/utils/errors';

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.rol;
    if (!userRole || !roles.includes(userRole)) {
      throw new ForbiddenError('No tienes permisos para esta acción');
    }
    next();
  };
}
