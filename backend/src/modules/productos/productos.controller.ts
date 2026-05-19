import { Request, Response, NextFunction } from 'express';
import * as service from './productos.service';
import * as fotosService from './fotos.service';
import { ListProductoQuerySchema } from './productos.schemas';
import { getAuditContext } from '@/shared/utils/auditContext';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ListProductoQuerySchema.parse({
      page: req.query.page,
      pageSize: req.query.pageSize,
      search: req.query.search,
      categoria: req.query.categoria,
      precioMin: req.query.precioMin,
      precioMax: req.query.precioMax,
    });
    const result = await service.findAll(query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const producto = await service.findById(req.params.id);
    res.json({ success: true, data: producto });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const producto = await service.create(req.body, getAuditContext(req));
    res.status(201).json({ success: true, data: producto });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const producto = await service.update(req.params.id, req.body, getAuditContext(req));
    res.json({ success: true, data: producto });
  } catch (error) {
    next(error);
  }
}

export async function deactivate(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.deactivate(req.params.id, getAuditContext(req));
    res.json({ success: true, data: result.producto, warning: result.warning });
  } catch (error) {
    next(error);
  }
}

// ─── Fotos ────────────────────────────────────────────────────────────────────

export async function subirFoto(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Se requiere el campo foto (multipart/form-data)' } });
      return;
    }

    const foto = await fotosService.subirFoto(req.params.id, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
      alt_text: typeof req.body.alt_text === 'string' ? req.body.alt_text : undefined,
    });

    res.status(201).json({ success: true, data: foto });
  } catch (error) {
    next(error);
  }
}

export async function setPrincipal(req: Request, res: Response, next: NextFunction) {
  try {
    const idFoto = parseInt(req.params.idFoto, 10);
    const data = await fotosService.setPrincipal(req.params.id, idFoto);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function reordenar(req: Request, res: Response, next: NextFunction) {
  try {
    const items = req.body;
    const data = await fotosService.reordenar(req.params.id, items);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function eliminarFoto(req: Request, res: Response, next: NextFunction) {
  try {
    const idFoto = parseInt(req.params.idFoto, 10);
    const data = await fotosService.eliminarFoto(req.params.id, idFoto);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
