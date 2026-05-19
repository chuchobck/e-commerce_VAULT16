import { Request, Response, NextFunction } from 'express';
import { MovimientoFiltersSchema } from '../schemas/inventario.schemas';
import * as ajustesSvc from '../services/inventario.ajustes.service';
import * as movimientosSvc from '../services/inventario.movimientos.service';

export async function ajustar(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await ajustesSvc.ajustarStock(req.body, req.user!.id) });
  } catch (e) { next(e); }
}

export async function stockBajo(req: Request, res: Response, next: NextFunction) {
  try {
    const umbral = req.query.umbral ? Number(req.query.umbral) : undefined;
    res.json({ success: true, data: await ajustesSvc.getStockBajo(umbral) });
  } catch (e) { next(e); }
}

export async function movimientos(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = MovimientoFiltersSchema.parse(req.query);
    res.json({ success: true, data: await movimientosSvc.getMovimientos(filters) });
  } catch (e) { next(e); }
}
