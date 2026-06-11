import { Router } from 'express';
import { authBackoffice } from '../../middleware/authBackoffice';
import { requireRole } from '../../middleware/requireRole';
import { validateRequest } from '../../middleware/validateRequest';
import { CreateAjusteSchema, AnularAjusteSchema } from './inventario.schemas';
import * as controller from './inventario.controller';

export const inventarioRouter = Router();

const adminOAlmacenista = [authBackoffice, requireRole('ADMIN', 'ALMACENISTA')];

// ─── Ajustes ──────────────────────────────────────────────────────────────────

inventarioRouter.get('/ajustes', ...adminOAlmacenista, controller.getAjustes);

inventarioRouter.get('/ajustes/:id', ...adminOAlmacenista, controller.getAjusteById);

inventarioRouter.post(
  '/ajustes',
  ...adminOAlmacenista,
  validateRequest({ body: CreateAjusteSchema }),
  controller.createAjuste
);

inventarioRouter.put(
  '/ajustes/:id/anular',
  ...adminOAlmacenista,
  validateRequest({ body: AnularAjusteSchema }),
  controller.anularAjuste
);

// ─── Movimientos / Ledger ─────────────────────────────────────────────────────

inventarioRouter.get('/movimientos', ...adminOAlmacenista, controller.getMovimientos);

inventarioRouter.get(
  '/movimientos/variante/:id',
  ...adminOAlmacenista,
  controller.getMovimientosByVariante
);

// ─── Stock actual ─────────────────────────────────────────────────────────────

inventarioRouter.get('/stock-actual', ...adminOAlmacenista, controller.getStockActual);
