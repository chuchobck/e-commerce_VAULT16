import { Router } from 'express';
import { authRouter } from '@/modules/auth/auth.routes';
import { rolesRouter } from '@/modules/roles/roles.routes';
import { categoriasRouter } from '@/modules/categorias/categorias.routes';
import { tallasRouter } from '@/modules/tallas/tallas.routes';
import { empleadosRouter } from '@/modules/empleados/empleados.routes';
import { clientesRouter } from '@/modules/clientes/clientes.routes';
import { direccionesRouter } from '@/modules/direcciones/direcciones.routes';
import { productosRouter } from '@/modules/productos/productos.routes';
import { variantesRouter, variantesNestedRouter } from '@/modules/variantes/variantes.routes';
import { auditRouter } from '@/modules/audit/audit.routes';
import { inventarioRouter } from '@/modules/inventario/inventario.routes';
import { promocionesRouter } from '@/modules/promociones/promociones.routes';
import { carritoRouter } from '@/modules/carrito/carrito.routes';
import { checkoutRouter } from '@/modules/checkout/checkout.routes';
import { pagosRouter } from '@/modules/pagos/pagos.routes';
import { facturasRouter } from '@/modules/facturas/facturas.routes';
import { assistantRouter, adminAssistantRouter } from '@/modules/assistant/assistant.routes';
import { dashboardRouter } from '@/modules/dashboard/dashboard.routes';

export const apiRouter = Router();

// Auth (login, register, verify email)
apiRouter.use('/auth', authRouter);

// Master routers
apiRouter.use('/roles', rolesRouter);
apiRouter.use('/categorias', categoriasRouter);
apiRouter.use('/tallas', tallasRouter);
apiRouter.use('/empleados', empleadosRouter);
apiRouter.use('/clientes', clientesRouter);

// Nested router for direcciones under clientes/me
apiRouter.use('/clientes/me/direcciones', direccionesRouter);

// Productos + variantes nested
apiRouter.use('/productos', productosRouter);
apiRouter.use('/productos/:id/variantes', variantesNestedRouter);

// Variantes top-level
apiRouter.use('/variantes', variantesRouter);

// Inventario (ajustes + movimientos + stock-actual)
apiRouter.use('/inventario', inventarioRouter);

// Promociones
apiRouter.use('/promociones', promocionesRouter);

// Carrito (cliente auth)
apiRouter.use('/carrito', carritoRouter);

// Checkout (cliente auth)
apiRouter.use('/checkout', checkoutRouter);

// Pagos (admin/vendedor)
apiRouter.use('/pagos', pagosRouter);

// Facturas (admin/vendedor + cliente /me)
// IMPORTANTE: las rutas /me deben ir registradas ANTES de /:id dentro del router
apiRouter.use('/facturas', facturasRouter);

// Assistant (chat IA)
apiRouter.use('/assistant', assistantRouter);
apiRouter.use('/admin', adminAssistantRouter);

// Dashboard (backoffice analytics)
apiRouter.use('/dashboard', dashboardRouter);

// Audit log (admin only)
apiRouter.use('/audit', auditRouter);

export default apiRouter;
