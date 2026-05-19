import { Request, Response, NextFunction } from 'express';
import { FacturaFiltersSchema } from '../schemas/facturas.schemas';
import * as svc from '../services/facturas.service';

// Backoffice
export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getFacturas(FacturaFiltersSchema.parse(req.query)) }); } catch (e) { next(e); }
}
export async function getOne(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getFacturaById(Number(req.params.id)) }); } catch (e) { next(e); }
}
export async function updateEstado(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateEstado(Number(req.params.id), req.body) }); } catch (e) { next(e); }
}

// Cliente
export async function misFacturas(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    res.json({ success: true, data: await svc.getFacturasCliente(req.cliente!.id, page, limit) });
  } catch (e) { next(e); }
}
export async function miFactura(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getFacturaClienteById(Number(req.params.id), req.cliente!.id) }); } catch (e) { next(e); }
}
