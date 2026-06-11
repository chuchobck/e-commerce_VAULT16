import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { ANTHROPIC_STUB_MODE } from './config/anthropic';
import { VOYAGE_STUB_MODE } from './config/voyage';
import { AZURE_STUB_MODE } from './config/azureBlob';
import { PAYPAL_STUB_MODE } from './config/paypal';
import { prisma } from './config/prisma';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { globalRateLimit } from './middleware/rateLimit';
import { apiRouter } from './routes/index';

const app = express();

// ── Trust proxy (Replit / load balancer) ─────────────────────────────────────
app.set('trust proxy', 1);

// ── Seguridad ────────────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  ...new Set([
    ...env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    env.FRONTEND_URL,
  ]),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origen no permitido: ${origin}`));
    },
    credentials: true,
  }),
);

// ── Parsers ──────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ──────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Rate limit global: 100 req/min por IP ────────────────────────────────────
app.use('/api/v1', globalRateLimit);

// ── Health check expandido ───────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  let dbStatus: 'ok' | 'fail' = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'fail';
  }

  const servicios = {
    anthropic: ANTHROPIC_STUB_MODE ? 'stub' : 'configured',
    voyage: VOYAGE_STUB_MODE ? 'stub' : 'configured',
    azureBlob: AZURE_STUB_MODE ? 'stub' : 'configured',
    paypal: PAYPAL_STUB_MODE ? 'stub' : 'configured',
  } as const;

  const status = dbStatus === 'fail' ? 'degraded' : 'ok';

  res.status(status === 'degraded' ? 503 : 200).json({
    status,
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
    servicios,
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Backend funcionando', api: '/api/v1' })
});

// ── Fallbacks ────────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export { app };
