import { Request, Response, NextFunction } from 'express';
import { ChatMessageSchema } from '../schemas/assistant.schemas';
import { streamChat } from '../services/assistant.service';

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = ChatMessageSchema.parse(req.body);

    // Configurar SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const gen = streamChat(dto);

    for await (const token of gen) {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e) {
    next(e);
  }
}
