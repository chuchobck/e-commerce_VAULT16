import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/variantes.service';

export async function listByProducto(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getVariantesByProducto(Number(req.params.productoId)) }); } catch (e) { next(e); }
}
export async function getOne(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getVarianteById(Number(req.params.id)) }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await svc.createVariante(req.body) }); } catch (e) { next(e); }
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateVariante(Number(req.params.id), req.body) }); } catch (e) { next(e); }
}
export async function toggle(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.toggleVariante(Number(req.params.id)) }); } catch (e) { next(e); }
}
