import { Router } from 'express';
import { authBackoffice } from '@/middleware/authBackoffice';
import { requireRole } from '@/middleware/requireRole';
import { validateRequest } from '@/middleware/validateRequest';
import { CreateRolSchema, UpdateRolSchema, RolIdParamSchema } from './roles.schemas';
import * as controller from './roles.controller';

export const rolesRouter = Router();

// GET /api/roles - listar todos (admin only)
rolesRouter.get(
  '/',
  authBackoffice,
  requireRole('ADMIN'),
  controller.getAll
);

// GET /api/roles/:id - detalle
rolesRouter.get(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: RolIdParamSchema }),
  controller.getById
);

// POST /api/roles - crear (admin only)
rolesRouter.post(
  '/',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ body: CreateRolSchema }),
  controller.create
);

// PUT /api/roles/:id - editar (admin only)
rolesRouter.put(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: RolIdParamSchema, body: UpdateRolSchema }),
  controller.update
);
