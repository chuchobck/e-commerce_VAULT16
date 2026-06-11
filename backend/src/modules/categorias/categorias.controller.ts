import { Request, Response, NextFunction } from 'express';
import * as service from './categorias.service';
import { getAuditContext } from '../../shared/utils/auditContext';

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const categorias = await service.findAllActive();
    res.json({ success: true, data: categorias });
  } catch (error) {
    next(error);
  }
}

export async function getAllIncludeInactive(_req: Request, res: Response, next: NextFunction) {
  try {
    const categorias = await service.findAll();
    res.json({ success: true, data: categorias });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const categoria = await service.findById(id);
    res.json({ success: true, data: categoria });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const categoria = await service.create(req.body, getAuditContext(req));
    res.status(201).json({ success: true, data: categoria });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const categoria = await service.update(id, req.body, getAuditContext(req));
    res.json({ success: true, data: categoria });
  } catch (error) {
    next(error);
  }
}

export async function deactivate(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const categoria = await service.deactivate(id, getAuditContext(req));
    res.json({ success: true, data: categoria });
  } catch (error) {
    next(error);
  }
}
