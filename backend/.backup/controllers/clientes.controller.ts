import { Request, Response, NextFunction } from 'express';
import { parsePageParams } from '../shared/utils/pagination';
import * as svc from '../services/clientes.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const params = parsePageParams(req);
    const search = req.query.search as string | undefined;
    res.json({ success: true, data: await svc.getClientes({ ...params, search }) });
  } catch (e) { next(e); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.getClienteById(Number(req.params.id)) });
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await svc.createCliente(req.body) });
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.updateCliente(Number(req.params.id), req.body) });
  } catch (e) { next(e); }
}

export async function toggle(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.toggleActivo(Number(req.params.id)) });
  } catch (e) { next(e); }
}
