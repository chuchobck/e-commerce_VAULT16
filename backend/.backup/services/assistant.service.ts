import { anthropic } from '../config/anthropic';
import { searchProductosByEmbedding } from './assistant.search.service';
import { ChatMessageDto } from '../schemas/assistant.schemas';

const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';

const SYSTEM_PROMPT = `Eres el asistente de compras de VAULT_16, una tienda de moda urbana.
Tu misión es ayudar a los clientes a encontrar la prenda perfecta.
Responde de forma amigable, concisa y útil. Usa emojis con moderación.
Si encuentras productos relevantes en el contexto, menciónalos con su precio.
Si no hay productos relevantes, sugiere que naveguen el catálogo o contacten al equipo.
NO inventes productos ni precios. Solo usa la información del contexto proporcionado.`;

function buildContexto(productos: Awaited<ReturnType<typeof searchProductosByEmbedding>>) {
  if (productos.length === 0) return '';
  const lista = productos
    .map((p) => `- ${p.nombre} (${p.categoria}) — $${p.precio} MXN\n  ${p.descripcionIA}`)
    .join('\n');
  return `\n\nProductos relevantes encontrados:\n${lista}`;
}

export async function* streamChat(dto: ChatMessageDto) {
  // RAG: buscar productos relevantes
  const productosRelevantes = await searchProductosByEmbedding(dto.message);
  const contexto = buildContexto(productosRelevantes);

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...dto.historial,
    { role: 'user', content: dto.message + contexto },
  ];

  const stream = anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages,
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text;
    }
  }

  return { productosRelevantes: productosRelevantes.map((p) => ({ id: p.id, nombre: p.nombre, precio: p.precio })) };
}
