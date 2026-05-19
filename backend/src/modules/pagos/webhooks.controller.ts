import { Request, Response } from 'express';
import { env } from '@/config/env';
import { stripeClient } from './stripe.service';
import { confirmar } from '@/modules/checkout/checkout.service';
import { prisma } from '@/config/prisma';

/**
 * POST /api/webhooks/stripe
 *
 * Recibe body RAW (express.raw aplicado en app.ts ANTES de express.json).
 * SIEMPRE responde 200 — Stripe reintenta si no recibe 200.
 */
export async function handleStripeWebhook(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'] as string | undefined;

  // ── Verificar firma ────────────────────────────────────────────────────────
  if (!stripeClient || !env.STRIPE_WEBHOOK_SECRET) {
    // Modo stub: ignorar webhook silenciosamente
    res.status(200).json({ received: true, mode: 'stub' });
    return;
  }

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(
      req.body as Buffer,
      sig ?? '',
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Firma inválida';
    console.error('[Stripe Webhook] Firma inválida:', msg);
    res.status(400).json({ error: msg });
    return;
  }

  // ── Manejar eventos ───────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const meta = pi.metadata as { id_cliente?: string; id_direccion_envio?: string };

        if (!meta.id_cliente || !meta.id_direccion_envio) {
          console.error('[Stripe Webhook] Metadata faltante en PaymentIntent', pi.id);
          break;
        }

        await confirmar({
          id_cliente: parseInt(meta.id_cliente, 10),
          id_direccion_envio: parseInt(meta.id_direccion_envio, 10),
          metodo_pago: 'STRIPE',
          referencia_externa: pi.id,
          estado_pago: 'COM',
        });

        console.info('[Stripe Webhook] Checkout confirmado para PI', pi.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        // No hay factura creada aún (la factura se crea en confirmar tras el success).
        // Registramos el intento fallido solo en log.
        const pi = event.data.object;
        const motivo = pi.last_payment_error?.message ?? 'Desconocido';
        console.warn('[Stripe Webhook] Pago fallido. PI:', pi.id, '| Motivo:', motivo);

        // Intentar registrar en audit sin FK a factura (tabla: pago_fallido_log)
        // No existe esa tabla, así que solo logueamos. El cliente verá su pago fallido en el frontend.
        break;
      }

      case 'charge.refunded':
        // Ya manejado por el endpoint /api/pagos/:id/reembolsar — ignorar.
        break;

      default:
        // Evento desconocido — solo lo logueamos, no fallamos.
        console.info('[Stripe Webhook] Evento no manejado:', event.type);
    }
  } catch (err) {
    // Logueamos el error pero NUNCA respondemos 500 a Stripe
    console.error('[Stripe Webhook] Error procesando evento', event.type, err);
  }

  // Stripe requiere 200 siempre
  res.status(200).json({ received: true });
}
