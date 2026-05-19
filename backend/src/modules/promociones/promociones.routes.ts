import { Router } from 'express';
import { authBackoffice } from '@/middleware/authBackoffice';
import { requireRole } from '@/middleware/requireRole';
import { validateRequest } from '@/middleware/validateRequest';
import {
  CreatePromocionSchema,
  UpdatePromocionSchema,
  AsociarProductosSchema,
} from './promociones.schemas';
import * as controller from './promociones.controller';

export const promocionesRouter = Router();

const adminOVendedor = [authBackoffice, requireRole('ADMIN', 'VENDEDOR')];

// ─── Lectura pública ──────────────────────────────────────────────────────────
// GET /api/promociones → solo vigentes y activas (público)
promocionesRouter.get('/', controller.getVigentes);

// ─── Lectura admin ────────────────────────────────────────────────────────────
// GET /api/promociones/all → todas (incluyendo INA y vencidas)
promocionesRouter.get('/all', ...adminOVendedor, controller.getAll);

// GET /api/promociones/:id → detalle + productos
promocionesRouter.get('/:id', controller.getById);

// ─── Mutaciones admin ─────────────────────────────────────────────────────────
promocionesRouter.post(
  '/',
  ...adminOVendedor,
  validateRequest({ body: CreatePromocionSchema }),
  controller.create
);

promocionesRouter.put(
  '/:id',
  ...adminOVendedor,
  validateRequest({ body: UpdatePromocionSchema }),
  controller.update
);

// DELETE lógico
promocionesRouter.delete('/:id', ...adminOVendedor, controller.deactivate);

// ─── Asociación de productos ──────────────────────────────────────────────────
promocionesRouter.post(
  '/:id/productos',
  ...adminOVendedor,
  validateRequest({ body: AsociarProductosSchema }),
  controller.asociarProductos
);

// DELETE físico de asociación
promocionesRouter.delete(
  '/:id/productos/:id_producto',
  ...adminOVendedor,
  controller.quitarProducto
);
