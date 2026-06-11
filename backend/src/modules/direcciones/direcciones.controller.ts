import { Request, Response, NextFunction } from 'express';
import * as service from './direcciones.service';
import { getAuditContext } from '../../shared/utils/auditContext';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente?.id;
    if (!idCliente) throw new Error('No authenticated');

    const direcciones = await service.findAllByCliente(idCliente);
    res.json({ success: true, data: direcciones });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const idCliente = req.cliente?.id;
    if (!idCliente) throw new Error('No authenticated');

    const direccion = await service.findById(id, idCliente);
    res.json({ success: true, data: direccion });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente?.id;
    if (!idCliente) throw new Error('No authenticated');

    const direccion = await service.create(idCliente, req.body, getAuditContext(req));
    res.status(201).json({ success: true, data: direccion });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const idCliente = req.cliente?.id;
    if (!idCliente) throw new Error('No authenticated');

    const direccion = await service.update(id, idCliente, req.body, getAuditContext(req));
    res.json({ success: true, data: direccion });
  } catch (error) {
    next(error);
  }
}

export async function deactivate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const idCliente = req.cliente?.id;
    if (!idCliente) throw new Error('No authenticated');

    const direccion = await service.deactivate(id, idCliente, getAuditContext(req));
    res.json({ success: true, data: direccion });
  } catch (error) {
    next(error);
  }
}

export async function setPrincipal(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const idCliente = req.cliente?.id;
    if (!idCliente) throw new Error('No authenticated');

    const direccion = await service.setPrincipal(id, idCliente, getAuditContext(req));
    res.json({ success: true, data: direccion });
  } catch (error) {
    next(error);
  }
}
