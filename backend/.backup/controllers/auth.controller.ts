import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { LoginDto, RegisterClienteDto } from '../schemas/auth.schemas';

export async function loginEmpleado(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.loginEmpleado(req.body as LoginDto);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function loginCliente(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.loginCliente(req.body as LoginDto);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function registerCliente(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.registerCliente(req.body as RegisterClienteDto);
    res.status(201).json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function me(req: Request, res: Response) {
  res.json({ success: true, data: req.user ?? req.cliente });
}
