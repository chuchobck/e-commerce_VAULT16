import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { anthropic, ANTHROPIC_STUB_MODE } from '../../config/anthropic';
import { generarEmbedding } from '../ai-content/ai-content.service';
import { buscarProductosRelevantes, ProductoContextResult } from './search.service';
import { NotFoundError, ForbiddenError } from '../../shared/utils/errors';
import { ListSesionesQueryInput } from './assistant.schemas';

// ─── System prompt del asistente ─────────────────────────────────────────────

function SYSTEM_PROMPT_ASSISTANT(contextoProductos: string): string {
  return `Sos el asistente de compras de VORTEX, una tienda streetwear urbana ecuatoriana.
Tu rol: ayudar a los clientes a encontrar lo que buscan, recomendar productos y responder dudas.
Tono: cercano, directo, joven. Español ecuatoriano neutro.
Sé conciso (máximo 3 párrafos). Mencioná productos por nombre cuando sean relevantes.

PRODUCTOS DISPONIBLES AHORA:
${contextoProductos || 'No hay productos con información IA generada todavía.'}

Solo recomendá productos de la lista de arriba. Si no hay productos relevantes, decile que puede explorar el catálogo.`;
}

function formatearContextoProductos(productos: ProductoContextResult[]): string {
  return productos
    .map(
      (p) =>
        `- ${p.nombre} (${p.categoria}) | $${p.precio_venta} | Tallas: ${p.tallas_disponibles} | Colores: ${p.colores}
  ${p.descripcion_larga?.substring(0, 150) ?? ''}...`,
    )
    .join('\n\n');
}

// ─── Gestión de sesiones ──────────────────────────────────────────────────────

export async function crearORecuperarSesion(
  idSesion: string | undefined,
  idCliente: number | undefined,
  ip: string | undefined,
  userAgent: string | undefined,
): Promise<string> {
  if (idSesion) {
    const sesion = await prisma.chat_sesion.findUnique({
      where: { id_sesion: idSesion },
    });
    if (!sesion) throw new NotFoundError('Sesión de chat no encontrada');
    // Verificar que la sesión pertenece al cliente si está logueado
    if (idCliente && sesion.id_cliente && sesion.id_cliente !== idCliente) {
      throw new ForbiddenError('No tenés acceso a esta sesión');
    }
    return sesion.id_sesion;
  }

  const nueva = await prisma.chat_sesion.create({
    data: {
      id_cliente: idCliente ?? null,
      ip_origen: ip ?? null,
      user_agent: userAgent ?? null,
    },
  });
  return nueva.id_sesion;
}

// ─── Pipeline SSE (streaming) ─────────────────────────────────────────────────

export async function responderAsistente(
  idSesion: string,
  mensaje: string,
  res: Response,
): Promise<void> {
  // 1. Persistir mensaje del usuario
  await prisma.chat_mensaje.create({
    data: { id_sesion: idSesion, rol: 'user', contenido: mensaje },
  });

  // 2. Embed + search
  const queryEmb = await generarEmbedding(mensaje);
  const productos = await buscarProductosRelevantes(queryEmb, 5);

  // 3. Historial (últimos 20 mensajes)
  const historial = await prisma.chat_mensaje.findMany({
    where: { id_sesion: idSesion },
    orderBy: { fecha: 'asc' },
    take: 20,
    select: { rol: true, contenido: true },
  });

  // 4. Contexto para Claude
  const contextoProductos = formatearContextoProductos(productos);

  // 5. Stream desde Claude (o stub)
  let respuestaCompleta = '';
  let tokensInput = 0;
  let tokensOutput = 0;

  if (ANTHROPIC_STUB_MODE) {
    const fake =
      `Hola! Te recomiendo el ${productos[0]?.nombre || 'Hoodie Phantom'}, ` +
      `está disponible y se ve genial. (Esto es una respuesta stub — configurá ANTHROPIC_API_KEY para respuestas reales.)`;

    for (const chunk of fake.match(/.{1,20}/g) ?? []) {
      res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
      await new Promise((r) => setTimeout(r, 50));
      respuestaCompleta += chunk;
    }
  } else {
    const stream = await anthropic!.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT_ASSISTANT(contextoProductos),
      messages: historial.map((m) => ({
        role: m.rol as 'user' | 'assistant',
        content: m.contenido,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        const text = event.delta.text;
        respuestaCompleta += text;
        res.write(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`);
      }
    }

    // Capturar tokens del mensaje final
    const finalMsg = await stream.finalMessage();
    tokensInput = finalMsg.usage.input_tokens;
    tokensOutput = finalMsg.usage.output_tokens;
  }

  // 6. Persistir respuesta del assistant (APPEND-ONLY)
  await prisma.chat_mensaje.create({
    data: {
      id_sesion: idSesion,
      rol: 'assistant',
      contenido: respuestaCompleta,
      productos_referenciados: productos.map((p) => p.id_producto),
      tokens_input: tokensInput || null,
      tokens_output: tokensOutput || null,
    },
  });

  // 7. Update fecha_ultimo_mensaje en chat_sesion
  await prisma.chat_sesion.update({
    where: { id_sesion: idSesion },
    data: { fecha_ultimo_mensaje: new Date() },
  });

  // 8. Cerrar stream
  res.write(
    `data: ${JSON.stringify({
      type: 'done',
      id_sesion: idSesion,
      productos_referenciados: productos.map((p) => p.id_producto),
    })}\n\n`,
  );
  res.end();
}

// ─── Pipeline síncrono (fallback sin SSE) ────────────────────────────────────

export async function responderAsistenteSincrono(
  idSesion: string,
  mensaje: string,
): Promise<{ respuesta: string; productos_referenciados: string[] }> {
  // 1. Persistir mensaje del usuario
  await prisma.chat_mensaje.create({
    data: { id_sesion: idSesion, rol: 'user', contenido: mensaje },
  });

  // 2. Embed + search
  const queryEmb = await generarEmbedding(mensaje);
  const productos = await buscarProductosRelevantes(queryEmb, 5);

  // 3. Historial
  const historial = await prisma.chat_mensaje.findMany({
    where: { id_sesion: idSesion },
    orderBy: { fecha: 'asc' },
    take: 20,
    select: { rol: true, contenido: true },
  });

  const contextoProductos = formatearContextoProductos(productos);
  let respuesta = '';
  let tokensInput = 0;
  let tokensOutput = 0;

  if (ANTHROPIC_STUB_MODE) {
    respuesta =
      `Hola! Te recomiendo el ${productos[0]?.nombre || 'Hoodie Phantom'}, ` +
      `está disponible y se ve genial. (Respuesta stub — configurá ANTHROPIC_API_KEY para respuestas reales.)`;
  } else {
    const msg = await anthropic!.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT_ASSISTANT(contextoProductos),
      messages: historial.map((m) => ({
        role: m.rol as 'user' | 'assistant',
        content: m.contenido,
      })),
    });
    respuesta = msg.content[0].type === 'text' ? msg.content[0].text : '';
    tokensInput = msg.usage.input_tokens;
    tokensOutput = msg.usage.output_tokens;
  }

  // Persistir respuesta (APPEND-ONLY)
  await prisma.chat_mensaje.create({
    data: {
      id_sesion: idSesion,
      rol: 'assistant',
      contenido: respuesta,
      productos_referenciados: productos.map((p) => p.id_producto),
      tokens_input: tokensInput || null,
      tokens_output: tokensOutput || null,
    },
  });

  await prisma.chat_sesion.update({
    where: { id_sesion: idSesion },
    data: { fecha_ultimo_mensaje: new Date() },
  });

  return { respuesta, productos_referenciados: productos.map((p) => p.id_producto) };
}

// ─── Listados de sesiones ─────────────────────────────────────────────────────

export async function getSesionesCliente(idCliente: number) {
  return prisma.chat_sesion.findMany({
    where: { id_cliente: idCliente },
    orderBy: { fecha_ultimo_mensaje: 'desc' },
    select: {
      id_sesion: true,
      fecha_inicio: true,
      fecha_ultimo_mensaje: true,
      _count: { select: { chat_mensaje: true } },
    },
  });
}

export async function getSesionDetalle(idSesion: string, idCliente?: number) {
  const sesion = await prisma.chat_sesion.findUnique({
    where: { id_sesion: idSesion },
    include: {
      chat_mensaje: {
        orderBy: { fecha: 'asc' },
        select: {
          id_mensaje: true,
          rol: true,
          contenido: true,
          productos_referenciados: true,
          fecha: true,
        },
      },
    },
  });

  if (!sesion) throw new NotFoundError('Sesión no encontrada');

  // Si es un cliente, solo puede ver sus propias sesiones
  if (idCliente !== undefined && sesion.id_cliente !== null && sesion.id_cliente !== idCliente) {
    throw new NotFoundError('Sesión no encontrada');
  }

  return sesion;
}

export async function getSesionesAdmin(query: ListSesionesQueryInput) {
  const { page, pageSize, id_cliente, desde, hasta } = query;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (id_cliente) where.id_cliente = id_cliente;
  if (desde || hasta) {
    where.fecha_inicio = {};
    if (desde) (where.fecha_inicio as Record<string, unknown>).gte = new Date(desde);
    if (hasta) (where.fecha_inicio as Record<string, unknown>).lte = new Date(hasta);
  }

  const [total, data] = await Promise.all([
    prisma.chat_sesion.count({ where }),
    prisma.chat_sesion.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { fecha_ultimo_mensaje: 'desc' },
      select: {
        id_sesion: true,
        id_cliente: true,
        fecha_inicio: true,
        fecha_ultimo_mensaje: true,
        ip_origen: true,
        _count: { select: { chat_mensaje: true } },
        cliente: {
          select: { nombre1: true, apellido1: true, email: true },
        },
      },
    }),
  ]);

  return {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
