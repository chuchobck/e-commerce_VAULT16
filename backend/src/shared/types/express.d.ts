// Extiende el Request de Express con propiedades de autenticación
import 'express';

interface UserPayload {
  id: number;
  email: string;
  rol: string;
}

interface ClientePayload {
  id: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      cliente?: ClientePayload;
    }
  }
}
