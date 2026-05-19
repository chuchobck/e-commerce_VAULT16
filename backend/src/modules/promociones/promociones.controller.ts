import { Request, Response, NextFunction } from 'express';
import * as service from './promociones.service';
import { getAuditContext } from '@/shared/utils/auditContext';

export async function getVigentes(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.findVigentes();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.findAll();
    res.json({ success: true, data });
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

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.create(req.body, getAuditContext(req));
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await service.update(id, req.body, getAuditContext(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function deactivate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await service.deactivate(id, getAuditContext(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function asociarProductos(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = await service.asociarProductos(id, req.body, getAuditContext(req));
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function quitarProducto(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const { id_producto } = req.params;
    const data = await service.quitarProducto(id, id_producto, getAuditContext(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
