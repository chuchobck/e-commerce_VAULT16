import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/tallas.service';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getTallas() }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await svc.createTalla(req.body) }); } catch (e) { next(e); }
}
export async function remove(req: Request, res: Response, next: NextFunction) {
  try { await svc.deleteTalla(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); }
}
