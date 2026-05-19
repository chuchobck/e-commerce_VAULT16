import { prisma } from '../config/prisma';
import { voyage } from '../config/voyage';
import { EMBEDDING_SEARCH_PROMPT } from './ai-content.prompts';

const EMBEDDING_MODEL = 'voyage-3';
const SIMILARITY_THRESHOLD = 0.75;
const TOP_K = 5;

export interface ProductoSearchResult {
  id: number;
  nombre: string;
  precio: number;
  descripcionIA: string;
  categoria: string;
  similarity: number;
}

export async function searchProductosByEmbedding(query: string): Promise<ProductoSearchResult[]> {
  const embeddingResponse = await voyage.embed({
    input: EMBEDDING_SEARCH_PROMPT(query),
    model: EMBEDDING_MODEL,
  });

  const embedding = (embeddingResponse as { data: Array<{ embedding: number[] }> }).data[0].embedding;
  const vectorStr = `[${embedding.join(',')}]`;

  const results = await prisma.$queryRaw<ProductoSearchResult[]>`
    SELECT
      p.id,
      p.nombre,
      p.precio::float AS precio,
      pa.descripcion_ia AS "descripcionIA",
      c.nombre AS categoria,
      1 - (pa.embedding <=> ${vectorStr}::vector) AS similarity
    FROM productos_ai pa
    JOIN productos p ON p.id = pa.producto_id
    JOIN categorias c ON c.id = p.categoria_id
    WHERE p.activo = true
      AND 1 - (pa.embedding <=> ${vectorStr}::vector) > ${SIMILARITY_THRESHOLD}
    ORDER BY similarity DESC
    LIMIT ${TOP_K}
  `;

  return results;
}
