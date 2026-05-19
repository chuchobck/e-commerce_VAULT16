import { Router } from 'express';
import { authBackoffice } from '@/middleware/authBackoffice';
import { requireRole } from '@/middleware/requireRole';
import { validateRequest } from '@/middleware/validateRequest';
import { CreateTallaSchema, UpdateTallaSchema, TallaIdParamSchema } from './tallas.schemas';
import * as controller from './tallas.controller';

export const tallasRouter = Router();

tallasRouter.get('/', controller.getAll);

tallasRouter.get(
  '/all',
  authBackoffice,
  requireRole('ADMIN'),
  controller.getAllIncludeInactive
);

tallasRouter.get(
  '/:id',
  validateRequest({ params: TallaIdParamSchema }),
  controller.getById
);

tallasRouter.post(
  '/',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ body: CreateTallaSchema }),
  controller.create
);

tallasRouter.put(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: TallaIdParamSchema, body: UpdateTallaSchema }),
  controller.update
);

tallasRouter.delete(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: TallaIdParamSchema }),
  controller.deactivate
);
