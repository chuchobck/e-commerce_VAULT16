import { z } from 'zod';

export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  historial: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .max(10)
    .default([]),
});

export type ChatMessageDto = z.infer<typeof ChatMessageSchema>;
