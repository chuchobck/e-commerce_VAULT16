import { Router } from 'express';
import { authCliente } from '@/middleware/authCliente';
import { validateRequest } from '@/middleware/validateRequest';
import {
  CreateDireccionSchema,
  UpdateDireccionSchema,
  DireccionIdParamSchema,
} from './direcciones.schemas';
import * as controller from './direcciones.controller';

export const direccionesRouter = Router();

// Todas las rutas requieren cliente autenticado
direccionesRouter.use(authCliente);

direccionesRouter.get(
  '/',
  controller.getAll
);

direccionesRouter.get(
  '/:id',
  validateRequest({ params: DireccionIdParamSchema }),
  controller.getById
);

direccionesRouter.post(
  '/',
  validateRequest({ body: CreateDireccionSchema }),
  controller.create
);

direccionesRouter.put(
  '/:id',
  validateRequest({ params: DireccionIdParamSchema, body: UpdateDireccionSchema }),
  controller.update
);

direccionesRouter.delete(
  '/:id',
  validateRequest({ params: DireccionIdParamSchema }),
  controller.deactivate
);

direccionesRouter.put(
  '/:id/principal',
  validateRequest({ params: DireccionIdParamSchema }),
  controller.setPrincipal
);
