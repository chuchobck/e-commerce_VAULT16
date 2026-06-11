import { Request, Response, NextFunction } from 'express';
import * as service from './pagos.service';
import { getAuditContext } from '../../shared/utils/auditContext';
import { ListPagosQuerySchema } from './pagos.schemas';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ListPagosQuerySchema.parse(req.query);
    const result = await service.findAll(query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await service.findById(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function confirmarPago(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await service.confirmarPago(id, getAuditContext(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function reembolsar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await service.reembolsar(id, getAuditContext(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
