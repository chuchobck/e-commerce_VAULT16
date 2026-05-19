import { Router, Request, Response, NextFunction } from 'express';
import { authBackoffice } from '@/middleware/authBackoffice';
import { authCliente } from '@/middleware/authCliente';
import { requireRole } from '@/middleware/requireRole';
import { validateRequest } from '@/middleware/validateRequest';
import * as controller from './pagos.controller';
import {
  IniciarPagoSchema,
  CapturarPayPalSchema,
} from '@/modules/checkout/checkout.schemas';
import * as checkoutService from '@/modules/checkout/checkout.service';

export const pagosRouter = Router();

const soloAdmin = [authBackoffice, requireRole('ADMIN')];
const adminOVendedor = [authBackoffice, requireRole('ADMIN', 'VENDEDOR')];

// ─── PayPal (cliente) ───────────────────────────────────────────────────────
// Alias bajo /api/pagos/paypal/* para cumplir el contrato del proyecto.
// La lógica vive en checkout.service (mismas validaciones de integridad +
// idempotencia que /api/checkout/paypal/capturar).

async function createOrderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const data = await checkoutService.iniciarPago(idCliente, {
      ...req.body,
      metodo_pago: 'PAYPAL',
    });
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function captureOrderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const data = await checkoutService.capturarPayPal(idCliente, {
      id_direccion_envio: req.body.id_direccion_envio,
      paypal_order_id: req.params.orderId,
    });
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

// POST /api/pagos/paypal/create-order
pagosRouter.post(
  '/paypal/create-order',
  authCliente,
  validateRequest({ body: IniciarPagoSchema.pick({ id_direccion_envio: true }) }),
  createOrderHandler,
);

// POST /api/pagos/paypal/capture-order/:orderId
pagosRouter.post(
  '/paypal/capture-order/:orderId',
  authCliente,
  validateRequest({ body: CapturarPayPalSchema.pick({ id_direccion_envio: true }) }),
  captureOrderHandler,
);

// ─── Backoffice ─────────────────────────────────────────────────────────────

// GET /api/pagos              → admin/vendedor
pagosRouter.get('/', ...adminOVendedor, controller.getAll);

// GET /api/pagos/:id          → admin/vendedor
pagosRouter.get('/:id', ...adminOVendedor, controller.getById);

// PUT /api/pagos/:id/confirmar → admin/vendedor — confirma TRANSFERENCIA PEN → COM
pagosRouter.put('/:id/confirmar', ...adminOVendedor, controller.confirmarPago);

// PUT /api/pagos/:id/reembolsar → admin — refund PayPal (real o stub) + pago REE
pagosRouter.put('/:id/reembolsar', ...soloAdmin, controller.reembolsar);
