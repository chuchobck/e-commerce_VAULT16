import { Router } from 'express';
import { authCliente } from '../../middleware/authCliente';
import { validateRequest } from '../../middleware/validateRequest';
import {
  PreviewSchema,
  IniciarPagoSchema,
  CapturarPayPalSchema,
  ConfirmarTarjetaSimuladaSchema,
} from './checkout.schemas';
import * as controller from './checkout.controller';

export const checkoutRouter = Router();

checkoutRouter.use(authCliente);

// POST /api/checkout/preview — calcula totales SIN crear nada
checkoutRouter.post(
  '/preview',
  validateRequest({ body: PreviewSchema }),
  controller.preview,
);

// POST /api/checkout/iniciar-pago
//   PAYPAL        → crea orden PayPal (devuelve paypal_order_id)
//   TARJETA       → sólo devuelve totales (tarjeta simulada en frontend)
//   TRANSFERENCIA → crea factura PEN
checkoutRouter.post(
  '/iniciar-pago',
  validateRequest({ body: IniciarPagoSchema }),
  controller.iniciarPago,
);

// POST /api/checkout/paypal/capturar — captura la orden aprobada por el cliente
checkoutRouter.post(
  '/paypal/capturar',
  validateRequest({ body: CapturarPayPalSchema }),
  controller.capturarPayPal,
);

// POST /api/checkout/tarjeta/confirmar — crea factura COM con tarjeta simulada
checkoutRouter.post(
  '/tarjeta/confirmar',
  validateRequest({ body: ConfirmarTarjetaSimuladaSchema }),
  controller.confirmarTarjetaSimulada,
);
