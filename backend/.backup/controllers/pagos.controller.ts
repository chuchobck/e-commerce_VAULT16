import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/pagos.service';

export async function createPaymentIntent(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.createPaymentIntent(req.cliente!.id, req.body) });
  } catch (e) { next(e); }
}
