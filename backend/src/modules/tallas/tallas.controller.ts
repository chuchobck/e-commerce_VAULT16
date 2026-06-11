import { Request, Response, NextFunction } from 'express';
import * as service from './tallas.service';
import { getAuditContext } from '../../shared/utils/auditContext';

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const tallas = await service.findAllActive();
    res.json({ success: true, data: tallas });
  } catch (error) {
    next(error);
  }
}

export async function getAllIncludeInactive(_req: Request, res: Response, next: NextFunction) {
  try {
    const tallas = await service.findAll();
    res.json({ success: true, data: tallas });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const talla = await service.findById(id);
    res.json({ success: true, data: talla });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const talla = await service.create(req.body, getAuditContext(req));
    res.status(201).json({ success: true, data: talla });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const talla = await service.update(id, req.body, getAuditContext(req));
    res.json({ success: true, data: talla });
  } catch (error) {
    next(error);
  }
}

export async function deactivate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const talla = await service.deactivate(id, getAuditContext(req));
    res.json({ success: true, data: talla });
  } catch (error) {
    next(error);
  }
}
