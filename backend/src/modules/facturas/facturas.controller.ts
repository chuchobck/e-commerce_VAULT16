import { Request, Response, NextFunction } from 'express';
import * as service from './facturas.service';
import { getAuditContext } from '@/shared/utils/auditContext';
import {
  ListFacturasQuerySchema,
  ListFacturasMeQuerySchema,
  CambiarEstadoSchema,
} from './facturas.schemas';

// ─── Admin/Vendedor ───────────────────────────────────────────────────────────

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ListFacturasQuerySchema.parse(req.query);
    const result = await service.findAll(query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.findById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function cambiarEstado(req: Request, res: Response, next: NextFunction) {
  try {
    const input = CambiarEstadoSchema.parse(req.body);
    const rol = req.user!.rol;
    const ctx = getAuditContext(req);
    const data = await service.cambiarEstado(req.params.id, input, rol, ctx);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getPdf(req: Request, res: Response, next: NextFunction) {
  try {
    // Admin/vendedor: sin restricción de cliente
    const data = await service.getPdfData(req.params.id);
    res.json({
      success: true,
      stub: true,
      message: 'PDF stub — generación real con pdfmake pendiente',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// ─── Cliente ──────────────────────────────────────────────────────────────────

export async function getAllMe(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const query = ListFacturasMeQuerySchema.parse(req.query);
    const result = await service.findAllMe(idCliente, query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getByIdMe(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const data = await service.findByIdMe(idCliente, req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getPdfMe(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const data = await service.getPdfData(req.params.id, idCliente);
    res.json({
      success: true,
      stub: true,
      message: 'PDF stub — generación real con pdfmake pendiente',
      data,
    });
  } catch (error) {
    next(error);
  }
}
