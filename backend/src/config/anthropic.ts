import Anthropic from '@anthropic-ai/sdk';
import { env } from './env';

export const anthropic = env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  : null;

export const ANTHROPIC_STUB_MODE = !anthropic;

if (ANTHROPIC_STUB_MODE) {
  console.warn('[WARN] ANTHROPIC_API_KEY no configurada — ai-content y assistant en modo stub');
}
