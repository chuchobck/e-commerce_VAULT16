import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/categorias.service';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getCategorias() }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await svc.createCategoria(req.body) }); } catch (e) { next(e); }
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateCategoria(Number(req.params.id), req.body) }); } catch (e) { next(e); }
}
export async function toggle(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.toggleCategoria(Number(req.params.id)) }); } catch (e) { next(e); }
}
