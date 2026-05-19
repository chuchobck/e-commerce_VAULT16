import { Request, Response, NextFunction } from 'express';
import * as service from './clientes.service';
import { getAuditContext } from '@/shared/utils/auditContext';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '20', 10);
    const search = req.query.search as string | undefined;
    
    const result = await service.findAll(search, page, pageSize);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const cliente = await service.findById(id);
    res.json({ success: true, data: cliente });
  } catch (error) {
    next(error);
  }
}

export async function updateEstado(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const cliente = await service.updateEstado(id, req.body, getAuditContext(req));
    res.json({ success: true, data: cliente });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.cliente?.id;
    if (!id) throw new Error('No authenticated');

    const cliente = await service.findById(id);
    res.json({ success: true, data: cliente });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.cliente?.id;
    if (!id) throw new Error('No authenticated');

    const cliente = await service.updatePerfil(id, req.body, getAuditContext(req));
    res.json({ success: true, data: cliente });
  } catch (error) {
    next(error);
  }
}

export async function updateMyPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.cliente?.id;
    if (!id) throw new Error('No authenticated');

    const cliente = await service.updatePassword(id, req.body);
    res.json({ success: true, data: cliente });
  } catch (error) {
    next(error);
  }
}
