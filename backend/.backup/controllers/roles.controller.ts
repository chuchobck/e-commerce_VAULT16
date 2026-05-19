import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/roles.service';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getRoles() }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await svc.createRol(req.body) }); } catch (e) { next(e); }
}
export async function remove(req: Request, res: Response, next: NextFunction) {
  try { await svc.deleteRol(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); }
}
