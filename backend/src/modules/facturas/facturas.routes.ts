import { Router } from 'express';
import { authBackoffice } from '@/middleware/authBackoffice';
import { authCliente } from '@/middleware/authCliente';
import { requireRole } from '@/middleware/requireRole';
import { validateRequest } from '@/middleware/validateRequest';
import { CambiarEstadoSchema } from './facturas.schemas';
import * as controller from './facturas.controller';

export const facturasRouter = Router();

const adminOVendedor = [authBackoffice, requireRole('ADMIN', 'VENDEDOR')];

// ─── Rutas de cliente (deben ir ANTES de las de admin para evitar colisiones) ─

// GET  /api/facturas/me        → cliente: sus facturas
facturasRouter.get('/me', authCliente, controller.getAllMe);

// GET  /api/facturas/me/:id/pdf → cliente dueño: stub PDF de su factura
facturasRouter.get('/me/:id/pdf', authCliente, controller.getPdfMe);

// GET  /api/facturas/me/:id    → cliente: detalle de su factura
facturasRouter.get('/me/:id', authCliente, controller.getByIdMe);

// ─── Rutas admin/vendedor ──────────────────────────────────────────────────────

// GET  /api/facturas           → admin/vendedor: todas paginado con filtros
facturasRouter.get('/', ...adminOVendedor, controller.getAll);

// GET  /api/facturas/:id       → admin/vendedor: detalle completo
facturasRouter.get('/:id', ...adminOVendedor, controller.getById);

// PUT  /api/facturas/:id/estado → admin/vendedor: cambiar estado
facturasRouter.put(
  '/:id/estado',
  ...adminOVendedor,
  validateRequest({ body: CambiarEstadoSchema }),
  controller.cambiarEstado,
);

// GET  /api/facturas/:id/pdf   → admin/vendedor: stub PDF
facturasRouter.get('/:id/pdf', ...adminOVendedor, controller.getPdf);
