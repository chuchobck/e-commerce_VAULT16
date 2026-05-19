import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/ai-content.service';

export async function generate(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await svc.generateProductContent(req.body) });
  } catch (e) { next(e); }
}
