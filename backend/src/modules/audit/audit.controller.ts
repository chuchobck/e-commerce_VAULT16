import { Request, Response, NextFunction } from 'express';
import * as service from './audit.service';
import { ListAuditQuerySchema } from './audit.schemas';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ListAuditQuerySchema.parse({
      page: req.query.page,
      pageSize: req.query.pageSize,
      tabla: req.query.tabla,
      accion: req.query.accion,
      usuario: req.query.usuario,
      desde: req.query.desde,
      hasta: req.query.hasta,
    });
    const result = await service.findAll(query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getByRegistro(req: Request, res: Response, next: NextFunction) {
  try {
    const { tabla, id_registro } = req.params;
    const registros = await service.findByRegistro(tabla, id_registro);
    res.json({ success: true, data: registros });
  } catch (error) {
    next(error);
  }
}
