import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ANTHROPIC_API_KEY: z.string().optional(),
  VOYAGE_API_KEY: z.string().optional(),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_BLOB_CONTAINER: z.string().default('vortex-productos'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:\n', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

// ── Warnings de servicios externos no configurados ────────────────────────────
if (!env.ANTHROPIC_API_KEY)
  console.warn('[WARN] ANTHROPIC_API_KEY no configurada — ai-content y assistant en modo stub');
if (!env.VOYAGE_API_KEY)
  console.warn('[WARN] VOYAGE_API_KEY no configurada — embeddings en modo stub');
if (!env.AZURE_STORAGE_CONNECTION_STRING)
  console.warn('[WARN] Azure Blob no configurada — fotos en modo stub');
if (!env.STRIPE_SECRET_KEY)
  console.warn('[WARN] Stripe no configurada — pagos en modo stub');
