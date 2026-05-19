import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/direcciones.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.getDireccionesCliente(req.cliente!.id) });
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await svc.createDireccion(req.cliente!.id, req.body) });
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.updateDireccion(Number(req.params.id), req.cliente!.id, req.body) });
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteDireccion(Number(req.params.id), req.cliente!.id);
    res.status(204).send();
  } catch (e) { next(e); }
}
