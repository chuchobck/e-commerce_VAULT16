import { Router } from 'express';
import { handleStripeWebhook } from './webhooks.controller';

export const webhooksRouter = Router();

// POST /api/webhooks/stripe
// El middleware express.raw() se aplica en app.ts ANTES de express.json()
webhooksRouter.post('/stripe', handleStripeWebhook);
