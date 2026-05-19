import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/checkout.service';

export async function checkout(req: Request, res: Response, next: NextFunction) {
  try {
    const factura = await svc.procesarCheckout(req.cliente!.id, req.body);
    res.status(201).json({ success: true, data: factura });
  } catch (e) { next(e); }
}
