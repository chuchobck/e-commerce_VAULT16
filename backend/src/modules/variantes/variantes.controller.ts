import { Request, Response, NextFunction } from 'express';
import * as service from './variantes.service';
import { getAuditContext } from '../../shared/utils/auditContext';

// GET /api/productos/:id/variantes
export async function getByProducto(req: Request, res: Response, next: NextFunction) {
  try {
    const variantes = await service.findAllByProducto(req.params.id);
    res.json({ success: true, data: variantes });
  } catch (error) {
    next(error);
  }
}

// POST /api/productos/:id/variantes
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const variante = await service.create(req.params.id, req.body, getAuditContext(req));
    res.status(201).json({ success: true, data: variante });
  } catch (error) {
    next(error);
  }
}

// PUT /api/variantes/:id
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const variante = await service.update(id, req.body, getAuditContext(req));
    res.json({ success: true, data: variante });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/variantes/:id
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const variante = await service.remove(id, getAuditContext(req));
    res.json({ success: true, data: variante });
  } catch (error) {
    next(error);
  }
}

// GET /api/variantes/sin-stock
export async function getSinStock(_req: Request, res: Response, next: NextFunction) {
  try {
    const variantes = await service.findSinStock();
    res.json({ success: true, data: variantes });
  } catch (error) {
    next(error);
  }
}

// GET /api/variantes/stock-bajo
export async function getStockBajo(_req: Request, res: Response, next: NextFunction) {
  try {
    const variantes = await service.findStockBajo();
    res.json({ success: true, data: variantes });
  } catch (error) {
    next(error);
  }
}
