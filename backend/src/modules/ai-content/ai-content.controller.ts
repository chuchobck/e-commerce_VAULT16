import { Request, Response, NextFunction } from 'express';
import * as service from './ai-content.service';

export async function generateAi(req: Request, res: Response, next: NextFunction) {
  try {
    const idProducto = req.params.id;
    const idEmpleado = req.user!.id;
    const data = await service.generarDescripcion(idProducto, idEmpleado);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getAiContent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getAiContent(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAiContent(req: Request, res: Response, next: NextFunction) {
  try {
    const idProducto = req.params.id;
    const idEmpleado = req.user!.id;
    const data = await service.eliminarAiContent(idProducto, idEmpleado);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
