import { Request, Response, NextFunction } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { ProductoFiltersSchema } from '../schemas/productos.schemas';
import * as svc from '../services/productos.service';
import * as fotosSvc from '../services/productos.fotos.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = ProductoFiltersSchema.parse(req.query);
    res.json({ success: true, data: await svc.getProductos(filters) });
  } catch (e) { next(e); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getProductoById(Number(req.params.id)) }); } catch (e) { next(e); }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.getProductoBySlug(req.params.slug) }); } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await svc.createProducto(req.body) }); } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.updateProducto(Number(req.params.id), req.body) }); } catch (e) { next(e); }
}

export async function toggle(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.toggleProducto(Number(req.params.id)) }); } catch (e) { next(e); }
}

// ─── Fotos ───────────────────────────────────────────────────────────────────
export async function uploadFoto(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) { res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Archivo requerido' } }); return; }
    const foto = await fotosSvc.uploadFoto(Number(req.params.id), req.file.buffer, req.file.mimetype, req.body.esPrincipal === 'true');
    res.status(201).json({ success: true, data: foto });
  } catch (e) { next(e); }
}

export async function setPrincipal(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await fotosSvc.setPrincipal(Number(req.params.fotoId), Number(req.params.id)) }); } catch (e) { next(e); }
}

export async function reorderFotos(req: Request, res: Response, next: NextFunction) {
  try { await fotosSvc.reorderFotos(Number(req.params.id), req.body.ordenIds); res.status(204).send(); } catch (e) { next(e); }
}

export async function deleteFoto(req: Request, res: Response, next: NextFunction) {
  try { await fotosSvc.deleteFoto(Number(req.params.fotoId), Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); }
}
