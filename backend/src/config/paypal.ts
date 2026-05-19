import { env } from './env';

export const PAYPAL_STUB_MODE = !env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET;

export const PAYPAL_API_BASE =
  env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

if (PAYPAL_STUB_MODE) {
  console.warn('[WARN] PAYPAL_CLIENT_ID/SECRET no configuradas — PayPal en modo stub');
}

let cachedToken: { access_token: string; expires_at: number } | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  if (PAYPAL_STUB_MODE) {
    throw new Error('PayPal no configurado (modo stub)');
  }

  if (cachedToken && cachedToken.expires_at > Date.now() + 60_000) {
    return cachedToken.access_token;
  }

  const credentials = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`,
  ).toString('base64');

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal OAuth failed: ${res.status} ${txt}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}
