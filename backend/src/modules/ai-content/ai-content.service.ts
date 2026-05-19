import { prisma } from '@/config/prisma';
import { anthropic, ANTHROPIC_STUB_MODE } from '@/config/anthropic';
import { voyage, VOYAGE_STUB_MODE } from '@/config/voyage';
import { NotFoundError, ApiError } from '@/shared/utils/errors';
import { registrarAudit } from '@/shared/utils/audit';
import { ProductoContext, PROMPT_DESCRIPCION_PRODUCTO_V1 } from './prompts';

// ─── Carga contexto del producto para IA ─────────────────────────────────────

async function loadProductoContext(idProducto: string): Promise<ProductoContext> {
  const producto = await prisma.producto.findUnique({
    where: { id_producto: idProducto },
    select: {
      nombre: true,
      precio_venta: true,
      categoria_producto: { select: { nombre: true } },
      variante_producto: {
        where: { var_saldo_final: { gt: 0 } },
        select: {
          color: true,
          talla: { select: { descripcion: true } },
        },
        distinct: ['color'],
      },
    },
  });

  if (!producto) throw new NotFoundError('Producto no encontrado');

  const colores = [...new Set(producto.variante_producto.map((v) => v.color))];
  const tallas = [
    ...new Set(producto.variante_producto.map((v) => v.talla.descripcion)),
  ];

  return {
    nombre: producto.nombre,
    categoria: producto.categoria_producto.nombre,
    colores,
    tallas,
    precio: Number(producto.precio_venta),
  };
}

// ─── Llamada a Claude ─────────────────────────────────────────────────────────

interface ClaudeResult {
  descripcion: string;
  bullets: string[];
  tags: string[];
}

async function callClaude(producto: ProductoContext): Promise<ClaudeResult> {
  if (ANTHROPIC_STUB_MODE) {
    console.warn('[ANTHROPIC STUB] Generando descripción fake');
    return {
      descripcion:
        `Descripción placeholder para ${producto.nombre}. ` +
        'Cuando configures ANTHROPIC_API_KEY se va a generar contenido real. '.repeat(3),
      bullets: [
        '100% algodón premium',
        'Corte oversize moderno',
        'Estampado serigrafiado',
        'Cuidado: lavar con agua fría',
        'Hecho en Ecuador',
      ],
      tags: ['streetwear', 'urbano', 'oversize'],
    };
  }

  try {
    const msg = await anthropic!.messages.create({
      model: PROMPT_DESCRIPCION_PRODUCTO_V1.modelo,
      max_tokens: 1024,
      system: PROMPT_DESCRIPCION_PRODUCTO_V1.system,
      messages: [
        {
          role: 'user',
          content: PROMPT_DESCRIPCION_PRODUCTO_V1.buildUserMessage(producto),
        },
      ],
    });

    // Loguear tokens consumidos
    console.info(
      `[AI] Tokens — input: ${msg.usage.input_tokens}, output: ${msg.usage.output_tokens}`,
    );

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    return JSON.parse(text) as ClaudeResult;
  } catch (err) {
    console.error('[AI] Error llamando a Claude:', err);
    throw new ApiError(502, 'AI_SERVICE_UNAVAILABLE', 'El servicio de IA no está disponible');
  }
}

// ─── Llamada a Voyage (embeddings) ───────────────────────────────────────────

export async function generarEmbedding(texto: string): Promise<number[]> {
  if (VOYAGE_STUB_MODE) {
    console.warn('[VOYAGE STUB] Generando embedding fake');
    // Vector 1024 determinístico (basado en longitud del texto)
    return Array.from({ length: 1024 }, (_, i) => Math.sin(i + texto.length) * 0.5);
  }

  try {
    const res = await voyage!.embed({ input: [texto], model: 'voyage-3' });
    return res.data![0].embedding!;
  } catch (err) {
    console.error('[AI] Error llamando a Voyage:', err);
    throw new ApiError(502, 'AI_SERVICE_UNAVAILABLE', 'El servicio de embeddings no está disponible');
  }
}

// ─── Pipeline principal ───────────────────────────────────────────────────────

export async function generarDescripcion(idProducto: string, idEmpleadoActor: number) {
  const producto = await loadProductoContext(idProducto);

  const { descripcion, bullets, tags } = await callClaude(producto);

  const textoCompleto = `${producto.nombre}. ${descripcion} Tags: ${tags.join(', ')}.`;
  const embedding = await generarEmbedding(textoCompleto);

  // UPSERT con $executeRaw porque Prisma no soporta el tipo vector(1024)
  await prisma.$executeRaw`
    INSERT INTO vortex.producto_ai (
      id_producto, descripcion_larga, bullet_points, tags_estilo,
      embedding, modelo_generacion, modelo_embedding
    ) VALUES (
      ${idProducto},
      ${descripcion},
      ${JSON.stringify(bullets)}::jsonb,
      ${JSON.stringify(tags)}::jsonb,
      ${`[${embedding.join(',')}]`}::vector,
      ${ANTHROPIC_STUB_MODE ? 'stub' : PROMPT_DESCRIPCION_PRODUCTO_V1.modelo},
      ${VOYAGE_STUB_MODE ? 'stub' : 'voyage-3'}
    )
    ON CONFLICT (id_producto) DO UPDATE SET
      descripcion_larga  = EXCLUDED.descripcion_larga,
      bullet_points      = EXCLUDED.bullet_points,
      tags_estilo        = EXCLUDED.tags_estilo,
      embedding          = EXCLUDED.embedding,
      modelo_generacion  = EXCLUDED.modelo_generacion,
      modelo_embedding   = EXCLUDED.modelo_embedding,
      version            = vortex.producto_ai.version + 1,
      fecha_generacion   = CURRENT_TIMESTAMP
  `;

  await registrarAudit({
    tabla: 'producto_ai',
    id_registro: idProducto,
    accion: 'INSERT',
    payload_despues: { descripcion, bullets, tags },
    id_usuario_bo: idEmpleadoActor,
  });

  return { descripcion, bullets, tags };
}

// ─── Lecturas ─────────────────────────────────────────────────────────────────

export async function getAiContent(idProducto: string) {
  const ai = await prisma.producto_ai.findUnique({
    where: { id_producto: idProducto },
    select: {
      descripcion_larga: true,
      bullet_points: true,
      tags_estilo: true,
      modelo_generacion: true,
      version: true,
      fecha_generacion: true,
    },
  });
  if (!ai) throw new NotFoundError('Contenido IA no generado para este producto');
  return ai;
}

// ─── Eliminar contenido IA ────────────────────────────────────────────────────

export async function eliminarAiContent(idProducto: string, idEmpleadoActor: number) {
  const ai = await prisma.producto_ai.findUnique({
    where: { id_producto: idProducto },
  });
  if (!ai) throw new NotFoundError('Contenido IA no encontrado para este producto');

  await prisma.producto_ai.delete({ where: { id_producto: idProducto } });

  await registrarAudit({
    tabla: 'producto_ai',
    id_registro: idProducto,
    accion: 'DELETE',
    payload_antes: { descripcion_larga: ai.descripcion_larga, version: ai.version },
    id_usuario_bo: idEmpleadoActor,
  });

  return { deleted: true, id_producto: idProducto };
}
