import { prisma } from '../config/prisma';
import { anthropic } from '../config/anthropic';
import { voyage } from '../config/voyage';
import { NotFoundError, ConflictError } from '../shared/utils/errors';
import { DESCRIPCION_PRODUCTO_PROMPT } from './ai-content.prompts';
import { GenerateContentDto } from '../schemas/ai-content.schemas';

const EMBEDDING_MODEL = 'voyage-3';
const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';

export async function generateProductContent(dto: GenerateContentDto) {
  const producto = await prisma.producto.findUnique({
    where: { id: dto.productoId },
    include: {
      categoria: true,
      variantes: { include: { talla: true }, where: { activo: true } },
      aiContent: true,
    },
  });

  if (!producto) throw new NotFoundError('Producto no encontrado');
  if (producto.aiContent && !dto.forzar) throw new ConflictError('El producto ya tiene contenido IA. Usa forzar=true para regenerar.');

  const tallas = [...new Set(producto.variantes.map((v) => v.talla.nombre))];
  const colores = [...new Set(producto.variantes.map((v) => v.color))];

  // 1. Generar descripción con Claude
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: DESCRIPCION_PRODUCTO_PROMPT({
          nombre: producto.nombre,
          categoria: producto.categoria.nombre,
          precio: Number(producto.precio),
          tallas,
          colores,
        }),
      },
    ],
  });

  const descripcionIA = message.content[0].type === 'text' ? message.content[0].text : '';

  // 2. Generar embedding con Voyage
  const textoEmbedding = `${producto.nombre} ${producto.categoria.nombre} ${descripcionIA}`;
  const embeddingResponse = await voyage.embed({
    input: textoEmbedding,
    model: EMBEDDING_MODEL,
  });

  const embedding = (embeddingResponse as { data: Array<{ embedding: number[] }> }).data[0].embedding;
  const embeddingVector = `[${embedding.join(',')}]`;

  // 3. Guardar en DB (upsert)
  const aiContent = await prisma.$queryRaw`
    INSERT INTO productos_ai (producto_id, descripcion_ia, embedding, modelo_embedding, creado_en, actualizado_en)
    VALUES (${dto.productoId}, ${descripcionIA}, ${embeddingVector}::vector, ${EMBEDDING_MODEL}, NOW(), NOW())
    ON CONFLICT (producto_id) DO UPDATE
    SET descripcion_ia = EXCLUDED.descripcion_ia,
        embedding = EXCLUDED.embedding,
        modelo_embedding = EXCLUDED.modelo_embedding,
        actualizado_en = NOW()
    RETURNING id, producto_id, descripcion_ia, modelo_embedding, creado_en
  `;

  return { productoId: dto.productoId, descripcionIA, embedding: embedding.slice(0, 5), aiContent };
}
