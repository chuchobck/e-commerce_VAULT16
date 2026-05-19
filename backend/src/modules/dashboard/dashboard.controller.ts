import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as service from './dashboard.service';

const RangoSchema = z.object({
  desde: z.string().datetime({ offset: true }).optional(),
  hasta: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function kpis(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getKpis();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function ventasPorDia(req: Request, res: Response, next: NextFunction) {
  try {
    const { desde, hasta } = RangoSchema.parse(req.query);
    const data = await service.getVentasPorDia(
      desde ? new Date(desde) : undefined,
      hasta ? new Date(hasta) : undefined,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function topProductos(req: Request, res: Response, next: NextFunction) {
  try {
    const { desde, hasta, limit } = RangoSchema.parse(req.query);
    const data = await service.getTopProductos(
      desde ? new Date(desde) : undefined,
      hasta ? new Date(hasta) : undefined,
      limit,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function stockBajo(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getStockBajo();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function usoIa(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getUsoIa();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function ventasPorCategoria(req: Request, res: Response, next: NextFunction) {
  try {
    const { desde, hasta } = RangoSchema.parse(req.query);
    const data = await service.getVentasPorCategoria(
      desde ? new Date(desde) : undefined,
      hasta ? new Date(hasta) : undefined,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
