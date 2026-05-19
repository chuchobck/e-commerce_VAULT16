import { Request, Response, NextFunction } from 'express';
import * as ajustesService from './ajustes.service';
import * as movimientosService from './movimientos.service';
import {
  ListAjustesQuerySchema,
  ListMovimientosQuerySchema,
  StockActualQuerySchema,
} from './inventario.schemas';

// ─── Ajustes ──────────────────────────────────────────────────────────────────

export async function getAjustes(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ListAjustesQuerySchema.parse({
      page: req.query.page,
      pageSize: req.query.pageSize,
      desde: req.query.desde,
      hasta: req.query.hasta,
      empleado: req.query.empleado,
    });
    const result = await ajustesService.findAll(query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getAjusteById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const ajuste = await ajustesService.findById(id);
    res.json({ success: true, data: ajuste });
  } catch (error) {
    next(error);
  }
}

export async function createAjuste(req: Request, res: Response, next: NextFunction) {
  try {
    const ajuste = await ajustesService.crearAjuste(req.body, req.user!.id);
    res.status(201).json({ success: true, data: ajuste });
  } catch (error) {
    next(error);
  }
}

export async function anularAjuste(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const ajuste = await ajustesService.anularAjuste(id, req.body, req.user!.id);
    res.json({ success: true, data: ajuste });
  } catch (error) {
    next(error);
  }
}

// ─── Movimientos / Ledger ─────────────────────────────────────────────────────

export async function getMovimientos(req: Request, res: Response, next: NextFunction) {
  try {
    const query = ListMovimientosQuerySchema.parse({
      page: req.query.page,
      pageSize: req.query.pageSize,
      id_variante: req.query.id_variante,
      tipo: req.query.tipo,
      desde: req.query.desde,
      hasta: req.query.hasta,
      id_empleado: req.query.id_empleado,
    });
    const result = await movimientosService.findAll(query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getMovimientosByVariante(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await movimientosService.findByVariante(id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getStockActual(req: Request, res: Response, next: NextFunction) {
  try {
    const query = StockActualQuerySchema.parse({
      categoria: req.query.categoria,
      stock_minimo: req.query.stock_minimo,
      stock_maximo: req.query.stock_maximo,
    });
    const data = await movimientosService.findStockActual(query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
