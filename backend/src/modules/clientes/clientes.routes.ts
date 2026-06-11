import { Router } from 'express';
import { authBackoffice } from '../../middleware/authBackoffice';
import { authCliente } from '../../middleware/authCliente';
import { requireRole } from '../../middleware/requireRole';
import { validateRequest } from '../../middleware/validateRequest';
import {
  ListClienteQuerySchema,
  UpdateClienteSchema,
  UpdatePasswordClienteSchema,
  UpdateEstadoSchema,
  ClienteIdParamSchema,
} from './clientes.schemas';
import * as controller from './clientes.controller';

export const clientesRouter = Router();

// Admin endpoints
clientesRouter.get(
  '/',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ query: ListClienteQuerySchema }),
  controller.getAll
);

clientesRouter.get(
  '/:id',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: ClienteIdParamSchema }),
  controller.getById
);

clientesRouter.put(
  '/:id/estado',
  authBackoffice,
  requireRole('ADMIN'),
  validateRequest({ params: ClienteIdParamSchema, body: UpdateEstadoSchema }),
  controller.updateEstado
);

// Cliente endpoints
clientesRouter.get(
  '/me',
  authCliente,
  controller.getMe
);

clientesRouter.put(
  '/me',
  authCliente,
  validateRequest({ body: UpdateClienteSchema }),
  controller.updateMe
);

clientesRouter.put(
  '/me/password',
  authCliente,
  validateRequest({ body: UpdatePasswordClienteSchema }),
  controller.updateMyPassword
);
