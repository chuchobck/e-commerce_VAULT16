import { Request, Response, NextFunction } from 'express';
import * as service from './empleados.service';
import { getAuditContext } from '../../shared/utils/auditContext';

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const empleados = await service.findAll();
    res.json({ success: true, data: empleados });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const empleado = await service.findById(id);
    res.json({ success: true, data: empleado });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const empleado = await service.create(req.body, getAuditContext(req));
    res.status(201).json({ success: true, data: empleado });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const empleado = await service.update(id, req.body, getAuditContext(req));
    res.json({ success: true, data: empleado });
  } catch (error) {
    next(error);
  }
}

export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const empleado = await service.updatePassword(id, req.body);
    res.json({ success: true, data: empleado });
  } catch (error) {
    next(error);
  }
}

export async function deactivate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const empleado = await service.deactivate(id, getAuditContext(req));
    res.json({ success: true, data: empleado });
  } catch (error) {
    next(error);
  }
}
