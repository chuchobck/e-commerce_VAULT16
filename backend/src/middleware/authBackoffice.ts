import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../shared/utils/jwt';
import { UnauthorizedError } from '../shared/utils/errors';

export function authBackoffice(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Token requerido');

  const token = header.slice(7);
  const payload = verifyToken(token, 'backoffice');

  req.user = payload;
  next();
}
