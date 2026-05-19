import { stripeClient, STRIPE_STUB_MODE } from '@/config/stripe';

export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, string>
) {
  if (STRIPE_STUB_MODE || !stripeClient) {
    console.warn('[STRIPE STUB] PaymentIntent fake creado', { amount, metadata });
    return { client_secret: 'pi_stub_' + Date.now(), id: 'stub_' + Date.now() };
  }
  return stripeClient.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe usa centavos
    currency: 'usd',
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

export async function refund(paymentIntentId: string, amountCents?: number) {
  if (STRIPE_STUB_MODE || !stripeClient) {
    console.warn('[STRIPE STUB] Refund fake', { paymentIntentId });
    return { id: 'rf_stub_' + Date.now(), status: 'succeeded' };
  }
  return stripeClient.refunds.create({
    payment_intent: paymentIntentId,
    ...(amountCents !== undefined ? { amount: amountCents } : {}),
  });
}

export { stripeClient };
