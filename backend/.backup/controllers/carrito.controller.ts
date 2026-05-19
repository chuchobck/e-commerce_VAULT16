import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/carrito.service';

export async function get(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getCarrito(req.cliente!.id) }); } catch (e) { next(e); }
}
export async function add(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.addItem(req.cliente!.id, req.body) }); } catch (e) { next(e); }
}
export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateItem(req.cliente!.id, Number(req.params.itemId), req.body) }); } catch (e) { next(e); }
}
export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.removeItem(req.cliente!.id, Number(req.params.itemId)) }); } catch (e) { next(e); }
}
export async function vaciar(req: Request, res: Response, next: NextFunction) {
  try { await svc.vaciarCarrito(req.cliente!.id); res.status(204).send(); } catch (e) { next(e); }
}
