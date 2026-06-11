import { Router } from 'express';
import { authBackoffice } from '../../middleware/authBackoffice';
import { authCliente } from '../../middleware/authCliente';
import { requireRole } from '../../middleware/requireRole';
import { validateRequest } from '../../middleware/validateRequest';
import { CreateCategoriaSchema, UpdateCategoriaSchema, CategoriaIdParamSchema } from './categorias.schemas';
import * as controller from './categorias.controller';

export const categoriasRouter = Router();

// GET /api/categorias - públi (solo ACT)
categoriasRouter.get(
  '/',
  controller.getAll
);

// GET /api/categorias/all - admin (incluye INA)
categoriasRouter.get(
  '/all',
  authBackoffice,
  requireRole('ADMIN'),
  controller.getAllIncludeInactive
);

// GET /api/categorias/:id
categoriasRouter.get(
  '/:id',
  validateRequest({ params: CategoriaIdParamSchema }),
  controller.getById
);

// POST /api/categorias - crear (admin only)
categoriasRouter.post(
  '/',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ body: CreateCategoriaSchema }),
  controller.create
);

// PUT /api/categorias/:id - editar (admin only)
categoriasRouter.put(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: CategoriaIdParamSchema, body: UpdateCategoriaSchema }),
  controller.update
);

// DELETE /api/categorias/:id - eliminación lógica (admin only)
categoriasRouter.delete(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: CategoriaIdParamSchema }),
  controller.deactivate
);
