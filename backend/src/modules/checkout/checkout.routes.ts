import { Router } from 'express';
import { authCliente } from '@/middleware/authCliente';
import { validateRequest } from '@/middleware/validateRequest';
import { PreviewSchema, IniciarPagoSchema } from './checkout.schemas';
import * as controller from './checkout.controller';

export const checkoutRouter = Router();

checkoutRouter.use(authCliente);

// POST /api/checkout/preview — calcula total SIN crear nada
checkoutRouter.post(
  '/preview',
  validateRequest({ body: PreviewSchema }),
  controller.preview
);

// POST /api/checkout/iniciar-pago — crea PaymentIntent (STRIPE) o factura pendiente (TRANSFERENCIA)
checkoutRouter.post(
  '/iniciar-pago',
  validateRequest({ body: IniciarPagoSchema }),
  controller.iniciarPago
);
