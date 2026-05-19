import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/dashboard.service';

export async function kpis(_req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getKPIs() }); } catch (e) { next(e); }
}

export async function ventasPorDia(req: Request, res: Response, next: NextFunction) {
  try {
    const dias = Number(req.query.dias ?? 30);
    res.json({ success: true, data: await svc.getVentasPorDia(dias) });
  } catch (e) { next(e); }
}

export async function topProductos(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Number(req.query.limit ?? 10);
    res.json({ success: true, data: await svc.getTopProductos(limit) });
  } catch (e) { next(e); }
}
