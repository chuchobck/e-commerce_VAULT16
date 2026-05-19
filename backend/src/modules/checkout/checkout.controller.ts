import { Request, Response, NextFunction } from 'express';
import * as service from './checkout.service';

export async function preview(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const data = await service.preview(idCliente, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function iniciarPago(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const data = await service.iniciarPago(idCliente, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
