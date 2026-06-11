import { Router } from 'express';
import { authBackoffice } from '../../middleware/authBackoffice';
import { requireRole } from '../../middleware/requireRole';
import { validateRequest } from '../../middleware/validateRequest';
import { CreateVarianteSchema, UpdateVarianteSchema, VarianteIdParamSchema } from './variantes.schemas';
import * as controller from './variantes.controller';

// Router para rutas top-level: /api/variantes/*
export const variantesRouter = Router();

variantesRouter.get(
  '/sin-stock',
  authBackoffice,
  requireRole('ADMIN', 'ALMACENISTA'),
  controller.getSinStock
);

variantesRouter.get(
  '/stock-bajo',
  authBackoffice,
  requireRole('ADMIN', 'ALMACENISTA'),
  controller.getStockBajo
);

variantesRouter.put(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: VarianteIdParamSchema, body: UpdateVarianteSchema }),
  controller.update
);

variantesRouter.delete(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: VarianteIdParamSchema }),
  controller.remove
);

// Router para rutas nested: /api/productos/:id/variantes
export const variantesNestedRouter = Router({ mergeParams: true });

variantesNestedRouter.get('/', controller.getByProducto);

variantesNestedRouter.post(
  '/',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ body: CreateVarianteSchema }),
  controller.create
);
