import Stripe from 'stripe';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { NotFoundError, ForbiddenError, BadRequestError } from '../shared/utils/errors';
import { PAGO_COMPLETADO, PAGO_FALLIDO, FACTURA_PAGADA } from '../shared/constants/estados';
import { CreatePaymentIntentDto } from '../schemas/pagos.schemas';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function createPaymentIntent(clienteId: number, dto: CreatePaymentIntentDto) {
  const factura = await prisma.factura.findUnique({
    where: { id: dto.facturaId },
    include: { pagos: true },
  });
  if (!factura) throw new NotFoundError('Factura no encontrada');
  if (factura.clienteId !== clienteId) throw new ForbiddenError();

  const pagoPendiente = factura.pagos.find((p) => p.estado === 'PENDIENTE');
  if (!pagoPendiente) throw new BadRequestError('No hay pago pendiente para esta factura');

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(factura.total) * 100), // centavos
    currency: 'mxn',
    metadata: { facturaId: factura.id.toString(), pagoId: pagoPendiente.id.toString() },
  });

  await prisma.pago.update({
    where: { id: pagoPendiente.id },
    data: { stripePaymentId: paymentIntent.id },
  });

  return { clientSecret: paymentIntent.client_secret };
}

export async function handleWebhook(rawBody: Buffer, signature: string) {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new BadRequestError('Webhook signature inválida');
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const pagoId = Number(pi.metadata.pagoId);

    await prisma.$transaction(async (tx) => {
      await tx.pago.update({
        where: { id: pagoId },
        data: { estado: PAGO_COMPLETADO, metodoPago: pi.payment_method_types[0] ?? 'card' },
      });
      const pago = await tx.pago.findUnique({ where: { id: pagoId } });
      if (pago) {
        await tx.factura.update({ where: { id: pago.facturaId }, data: { estado: FACTURA_PAGADA } });
      }
    });
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const pagoId = Number(pi.metadata.pagoId);
    await prisma.pago.update({ where: { id: pagoId }, data: { estado: PAGO_FALLIDO } });
  }
}
