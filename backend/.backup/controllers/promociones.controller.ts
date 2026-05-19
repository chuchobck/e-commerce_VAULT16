import { Request, Response, NextFunction } from 'express';
import { parsePageParams } from '../shared/utils/pagination';
import * as svc from '../services/promociones.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getPromociones(parsePageParams(req)) }); } catch (e) { next(e); }
}
export async function getOne(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getPromocionById(Number(req.params.id)) }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await svc.createPromocion(req.body) }); } catch (e) { next(e); }
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updatePromocion(Number(req.params.id), req.body) }); } catch (e) { next(e); }
}
export async function toggle(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.togglePromocion(Number(req.params.id)) }); } catch (e) { next(e); }
}
export async function validarCodigo(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getPromocionByCodigoActiva(req.params.codigo) }); } catch (e) { next(e); }
}
