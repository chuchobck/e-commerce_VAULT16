import { Router } from 'express';
import { authBackoffice } from '@/middleware/authBackoffice';
import { requireRole } from '@/middleware/requireRole';
import { validateRequest } from '@/middleware/validateRequest';
import {
  CreateEmpleadoSchema,
  UpdateEmpleadoSchema,
  UpdatePasswordSchema,
  EmpleadoIdParamSchema,
} from './empleados.schemas';
import * as controller from './empleados.controller';

export const empleadosRouter = Router();

empleadosRouter.get(
  '/',
  authBackoffice,
  requireRole('ADMIN'),
  controller.getAll
);

empleadosRouter.get(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: EmpleadoIdParamSchema }),
  controller.getById
);

empleadosRouter.post(
  '/',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ body: CreateEmpleadoSchema }),
  controller.create
);

empleadosRouter.put(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: EmpleadoIdParamSchema, body: UpdateEmpleadoSchema }),
  controller.update
);

empleadosRouter.put(
  '/:id/password',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: EmpleadoIdParamSchema, body: UpdatePasswordSchema }),
  controller.updatePassword
);

empleadosRouter.delete(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: EmpleadoIdParamSchema }),
  controller.deactivate
);
