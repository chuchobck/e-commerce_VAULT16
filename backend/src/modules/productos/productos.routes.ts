import { Router } from 'express';
import { authBackoffice } from '@/middleware/authBackoffice';
import { requireRole } from '@/middleware/requireRole';
import { validateRequest } from '@/middleware/validateRequest';
import { uploadFoto } from '@/middleware/upload';
import { CreateProductoSchema, UpdateProductoSchema } from './productos.schemas';
import * as controller from './productos.controller';
import * as aiController from '@/modules/ai-content/ai-content.controller';

export const productosRouter = Router();

const adminOMarketing = [authBackoffice, requireRole('ADMIN', 'VENDEDOR')];

// Públicos
productosRouter.get('/', controller.getAll);
productosRouter.get('/:id', controller.getById);

// Admin — CRUD base
productosRouter.post(
  '/',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ body: CreateProductoSchema }),
  controller.create
);

productosRouter.put(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ body: UpdateProductoSchema }),
  controller.update
);

productosRouter.delete(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  controller.deactivate
);

// ─── Fotos ────────────────────────────────────────────────────────────────────

// POST /api/productos/:id/fotos          → subir foto (multipart)
productosRouter.post(
  '/:id/fotos',
  ...adminOMarketing,
  uploadFoto.single('foto'),
  controller.subirFoto,
);

// PUT /api/productos/:id/fotos/orden     → reordenar (ANTES de /:idFoto para no colisionar)
productosRouter.put(
  '/:id/fotos/orden',
  ...adminOMarketing,
  controller.reordenar,
);

// PUT /api/productos/:id/fotos/:idFoto/principal
productosRouter.put(
  '/:id/fotos/:idFoto/principal',
  ...adminOMarketing,
  controller.setPrincipal,
);

// DELETE /api/productos/:id/fotos/:idFoto
productosRouter.delete(
  '/:id/fotos/:idFoto',
  ...adminOMarketing,
  controller.eliminarFoto,
);

// ─── AI Content ───────────────────────────────────────────────────────────────

// POST /api/productos/:id/generate-ai   → generar/regenerar contenido IA
productosRouter.post(
  '/:id/generate-ai',
  authBackoffice,
  requireRole('ADMIN', 'VENDEDOR'),
  aiController.generateAi,
);

// GET  /api/productos/:id/ai            → leer contenido IA (público)
productosRouter.get('/:id/ai', aiController.getAiContent);

// DELETE /api/productos/:id/ai          → eliminar contenido IA
productosRouter.delete(
  '/:id/ai',
  authBackoffice,
  requireRole('ADMIN', 'VENDEDOR'),
  aiController.deleteAiContent,
);
