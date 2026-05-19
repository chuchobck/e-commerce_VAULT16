import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from './errors';

type Audience = 'backoffice' | 'cliente';

interface BackofficePayload {
  id: number;
  email: string;
  rol: string;
}

interface ClientePayload {
  id: number;
  email: string;
}

export function signToken(payload: BackofficePayload, audience: 'backoffice'): string;
export function signToken(payload: ClientePayload, audience: 'cliente'): string;
export function signToken(payload: object, audience: Audience): string {
  const secret = env.JWT_SECRET;
  const expiresIn = env.JWT_EXPIRES_IN;
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string, audience: 'backoffice'): BackofficePayload;
export function verifyToken(token: string, audience: 'cliente'): ClientePayload;
export function verifyToken(token: string, audience: Audience): BackofficePayload | ClientePayload {
  try {
    const secret = env.JWT_SECRET;
    return jwt.verify(token, secret) as BackofficePayload | ClientePayload;
  } catch {
    throw new UnauthorizedError('Token inválido o expirado');
  }
}
