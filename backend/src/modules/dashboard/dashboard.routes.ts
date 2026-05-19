import { Router } from 'express';
import { authBackoffice } from '@/middleware/authBackoffice';
import { requireRole } from '@/middleware/requireRole';
import * as controller from './dashboard.controller';

export const dashboardRouter = Router();

const adminGuard = [authBackoffice, requireRole('ADMIN', 'VENDEDOR')];

dashboardRouter.get('/kpis', ...adminGuard, controller.kpis);
dashboardRouter.get('/ventas-por-dia', ...adminGuard, controller.ventasPorDia);
dashboardRouter.get('/top-productos', ...adminGuard, controller.topProductos);
dashboardRouter.get('/stock-bajo', ...adminGuard, controller.stockBajo);
dashboardRouter.get('/uso-ia', ...adminGuard, controller.usoIa);
dashboardRouter.get('/ventas-por-categoria', ...adminGuard, controller.ventasPorCategoria);
