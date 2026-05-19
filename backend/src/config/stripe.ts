import Stripe from 'stripe';
import { env } from './env';

export const stripeClient: Stripe | null = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

export const STRIPE_STUB_MODE = !stripeClient;

if (STRIPE_STUB_MODE) {
  console.warn('[WARN] STRIPE_SECRET_KEY no configurada — pagos en modo stub');
}
