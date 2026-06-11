import { Router } from 'express';
import { authBackoffice } from '../../middleware/authBackoffice';
import { requireRole } from '../../middleware/requireRole';
import * as controller from './audit.controller';

export const auditRouter = Router();

// Todos los endpoints de audit solo son accesibles para ADMIN
auditRouter.use(authBackoffice, requireRole('ADMIN'));

// GET /api/audit
auditRouter.get('/', controller.getAll);

// GET /api/audit/:tabla/:id_registro
auditRouter.get('/:tabla/:id_registro', controller.getByRegistro);
