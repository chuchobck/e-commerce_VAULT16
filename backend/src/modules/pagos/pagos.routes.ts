import { Router } from 'express';
import { authBackoffice } from '@/middleware/authBackoffice';
import { requireRole } from '@/middleware/requireRole';
import * as controller from './pagos.controller';

export const pagosRouter = Router();

const soloAdmin = [authBackoffice, requireRole('ADMIN')];
const adminOVendedor = [authBackoffice, requireRole('ADMIN', 'VENDEDOR')];

// GET /api/pagos              → admin
pagosRouter.get('/', ...adminOVendedor, controller.getAll);

// GET /api/pagos/:id          → admin
pagosRouter.get('/:id', ...adminOVendedor, controller.getById);

// PUT /api/pagos/:id/confirmar → admin/vendedor — confirma TRANSFERENCIA PEN → COM
pagosRouter.put('/:id/confirmar', ...adminOVendedor, controller.confirmarPago);

// PUT /api/pagos/:id/reembolsar → admin — crea nuevo pago REE + Stripe refund si aplica
pagosRouter.put('/:id/reembolsar', ...soloAdmin, controller.reembolsar);
