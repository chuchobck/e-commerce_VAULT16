import { Request, Response, NextFunction } from 'express';
import * as service from './roles.service';
import { getAuditContext } from '@/shared/utils/auditContext';

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await service.findAll();
    res.json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const rol = await service.findById(id);
    res.json({ success: true, data: rol });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const rol = await service.create(req.body, getAuditContext(req));
    res.status(201).json({ success: true, data: rol });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const rol = await service.update(id, req.body, getAuditContext(req));
    res.json({ success: true, data: rol });
  } catch (error) {
    next(error);
  }
}
