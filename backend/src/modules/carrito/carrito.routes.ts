import { Router } from 'express';
import { authCliente } from '../../middleware/authCliente';
import { validateRequest } from '../../middleware/validateRequest';
import { AgregarItemSchema, ActualizarCantidadSchema } from './carrito.schemas';
import * as controller from './carrito.controller';

export const carritoRouter = Router();

// Todos los endpoints del carrito requieren auth de cliente
carritoRouter.use(authCliente);

// GET /api/carrito
carritoRouter.get('/', controller.getCarrito);

// GET /api/carrito/validar  (antes de /:id para no colisionar)
carritoRouter.get('/validar', controller.validarCarrito);

// POST /api/carrito/items
carritoRouter.post(
  '/items',
  validateRequest({ body: AgregarItemSchema }),
  controller.agregarItem
);

// PUT /api/carrito/items/:id
carritoRouter.put(
  '/items/:id',
  validateRequest({ body: ActualizarCantidadSchema }),
  controller.actualizarCantidad
);

// DELETE /api/carrito/items/:id
carritoRouter.delete('/items/:id', controller.quitarItem);

// DELETE /api/carrito  → vaciar
carritoRouter.delete('/', controller.vaciarCarrito);
