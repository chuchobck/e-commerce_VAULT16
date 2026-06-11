import { PAYPAL_API_BASE, PAYPAL_STUB_MODE, getPayPalAccessToken } from '../../config/paypal';

export interface PayPalCreateOrderResult {
  id: string;
  status: string;
  stub: boolean;
}

export interface PayPalCaptureResult {
  id: string;
  status: string;
  captureId: string | null;
  payerEmail: string | null;
  amountValue: string | null;
  currencyCode: string | null;
  customId: string | null;
  stub: boolean;
}

/**
 * Crea una orden PayPal (intent=CAPTURE). En stub devuelve un id falso.
 */
export async function createOrder(
  amountUsd: number,
  metadata: { id_cliente: number; id_direccion_envio: number },
): Promise<PayPalCreateOrderResult> {
  if (PAYPAL_STUB_MODE) {
    const id = `STUB-ORDER-${Date.now()}`;
    console.warn('[PAYPAL STUB] createOrder', { id, amountUsd, metadata });
    return { id, status: 'CREATED', stub: true };
  }

  const token = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `cli_${metadata.id_cliente}_dir_${metadata.id_direccion_envio}`,
          amount: { currency_code: 'USD', value: amountUsd.toFixed(2) },
          custom_id: `${metadata.id_cliente}:${metadata.id_direccion_envio}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal createOrder failed: ${res.status} ${txt}`);
  }

  const data = (await res.json()) as { id: string; status: string };
  return { id: data.id, status: data.status, stub: false };
}

/**
 * Captura una orden previamente creada por PayPal.
 */
export async function captureOrder(orderId: string): Promise<PayPalCaptureResult> {
  if (PAYPAL_STUB_MODE) {
    console.warn('[PAYPAL STUB] captureOrder', { orderId });
    return {
      id: orderId,
      status: 'COMPLETED',
      captureId: `STUB-CAP-${Date.now()}`,
      payerEmail: 'stub@vault16.ec',
      amountValue: null,
      currencyCode: 'USD',
      customId: null,
      stub: true,
    };
  }

  const token = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal captureOrder failed: ${res.status} ${txt}`);
  }

  const data = (await res.json()) as {
    id: string;
    status: string;
    payer?: { email_address?: string };
    purchase_units?: {
      custom_id?: string;
      reference_id?: string;
      payments?: {
        captures?: {
          id: string;
          amount?: { value?: string; currency_code?: string };
          custom_id?: string;
        }[];
      };
    }[];
  };

  const unit = data.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  return {
    id: data.id,
    status: data.status,
    captureId: capture?.id ?? null,
    payerEmail: data.payer?.email_address ?? null,
    amountValue: capture?.amount?.value ?? null,
    currencyCode: capture?.amount?.currency_code ?? null,
    customId: capture?.custom_id ?? unit?.custom_id ?? null,
    stub: false,
  };
}

/**
 * Reembolso de una captura PayPal (referencia_externa = captureId).
 * En stub o cuando no hay captureId, devuelve un id falso.
 */
export async function refundCapture(
  captureId: string,
  amountUsd?: number,
): Promise<{ id: string; status: string; stub: boolean }> {
  if (PAYPAL_STUB_MODE || captureId.startsWith('STUB-')) {
    console.warn('[PAYPAL STUB] refundCapture', { captureId, amountUsd });
    return { id: `STUB-REF-${Date.now()}`, status: 'COMPLETED', stub: true };
  }

  const token = await getPayPalAccessToken();
  const body =
    amountUsd !== undefined
      ? { amount: { value: amountUsd.toFixed(2), currency_code: 'USD' } }
      : {};

  const res = await fetch(`${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal refund failed: ${res.status} ${txt}`);
  }

  const data = (await res.json()) as { id: string; status: string };
  return { id: data.id, status: data.status, stub: false };
}
