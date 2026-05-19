import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/pagos.service';

export async function stripeWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.headers['stripe-signature'] as string;
    // El body debe llegar como Buffer (raw) — ver configuración en app.ts
    await svc.handleWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (e) { next(e); }
}
