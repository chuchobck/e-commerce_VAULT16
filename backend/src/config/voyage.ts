import { VoyageAIClient } from 'voyageai';
import { env } from './env';

export const voyage = env.VOYAGE_API_KEY
  ? new VoyageAIClient({ apiKey: env.VOYAGE_API_KEY })
  : null;

export const VOYAGE_STUB_MODE = !voyage;

if (VOYAGE_STUB_MODE) {
  console.warn('[WARN] VOYAGE_API_KEY no configurada — embeddings en modo stub');
}
