import { Request, Response, NextFunction } from 'express';
import { parsePageParams } from '../shared/utils/pagination';
import * as svc from '../services/empleados.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getEmpleados(parsePageParams(req)) }); } catch (e) { next(e); }
}
export async function getOne(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getEmpleadoById(Number(req.params.id)) }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await svc.createEmpleado(req.body) }); } catch (e) { next(e); }
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateEmpleado(Number(req.params.id), req.body) }); } catch (e) { next(e); }
}
export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try { await svc.changePassword(Number(req.params.id), req.body); res.status(204).send(); } catch (e) { next(e); }
}
export async function toggle(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.toggleActivo(Number(req.params.id)) }); } catch (e) { next(e); }
}
