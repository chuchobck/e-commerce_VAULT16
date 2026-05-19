import { prisma } from '@/config/prisma';
import { NotFoundError, ConflictError } from '@/shared/utils/errors';
import { getDescuentoActivoProducto } from '@/shared/utils/promocionesHelper';
import { AgregarItemInput, ActualizarCantidadInput } from './carrito.schemas';

// ─── Helpers internos ─────────────────────────────────────────────────────────

async function getOrCreateCarrito(idCliente: number) {
  return prisma.carrito.upsert({
    where: { id_cliente: idCliente },
    create: { id_cliente: idCliente },
    update: {},
    select: { id_carrito: true },
  });
}

async function getVarianteConProducto(idVariante: number) {
  const variante = await prisma.variante_producto.findUnique({
    where: { id_variante: idVariante },
    include: {
      producto: {
        select: {
          id_producto: true,
          nombre: true,
          precio_venta: true,
          estado_prod: true,
          producto_fotos: {
            where: { es_principal: true },
            take: 1,
            select: { url_foto: true },
          },
        },
      },
      talla: { select: { descripcion: true } },
    },
  });

  if (!variante) throw new NotFoundError('Variante no encontrada');
  if (variante.producto.estado_prod !== 'ACT') {
    throw new ConflictError('El producto no está disponible');
  }

  return variante;
}

// ─── Construir resumen del carrito ────────────────────────────────────────────

async function buildCarritoResponse(idCarrito: number, idCliente: number) {
  const carrito = await prisma.carrito.findUnique({
    where: { id_carrito: idCarrito },
    include: {
      carrito_detalle: {
        include: {
          variante_producto: {
            include: {
              producto: {
                select: {
                  id_producto: true,
                  nombre: true,
                  precio_venta: true,
                  estado_prod: true,
                  producto_fotos: {
                    where: { es_principal: true },
                    take: 1,
                    select: { url_foto: true },
                  },
                },
              },
              talla: { select: { descripcion: true } },
            },
          },
        },
        orderBy: { fecha_agregado: 'asc' },
      },
    },
  });

  if (!carrito) {
    // Carrito vacío — retornamos estructura coherente
    return {
      id_carrito: null,
      id_cliente: idCliente,
      items: [],
      resumen: { subtotal: 0, descuento_total: 0, total: 0, cantidad_items: 0 },
    };
  }

  // Calcular descuentos por item
  const items = await Promise.all(
    carrito.carrito_detalle.map(async (det) => {
      const prod = det.variante_producto.producto;
      const precioUnitario = Number(prod.precio_venta);
      const descuentoPct = await getDescuentoActivoProducto(prod.id_producto);
      const subtotalLinea = det.cantidad * precioUnitario;
      const descuentoLinea = subtotalLinea * (descuentoPct / 100);
      const totalLinea = subtotalLinea - descuentoLinea;

      return {
        id_carrito_det: det.id_carrito_det,
        cantidad: det.cantidad,
        fecha_agregado: det.fecha_agregado,
        variante: {
          id: det.variante_producto.id_variante,
          color: det.variante_producto.color,
          talla: det.variante_producto.talla.descripcion,
          sku: det.variante_producto.sku,
          stock_disponible: det.variante_producto.var_saldo_final ?? 0,
        },
        producto: {
          id: prod.id_producto,
          nombre: prod.nombre,
          foto_principal: prod.producto_fotos[0]?.url_foto ?? null,
          precio_venta: precioUnitario,
        },
        descuento_pct: descuentoPct,
        subtotal: subtotalLinea,
        descuento_aplicado: descuentoLinea,
        total_linea: totalLinea,
      };
    })
  );

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const descuento_total = items.reduce((s, i) => s + i.descuento_aplicado, 0);
  const total = subtotal - descuento_total;
  const cantidad_items = items.reduce((s, i) => s + i.cantidad, 0);

  return {
    id_carrito: carrito.id_carrito,
    id_cliente: carrito.id_cliente,
    items,
    resumen: { subtotal, descuento_total, total, cantidad_items },
  };
}

// ─── Servicio público ─────────────────────────────────────────────────────────

export async function getCarrito(idCliente: number) {
  const carrito = await prisma.carrito.findUnique({
    where: { id_cliente: idCliente },
    select: { id_carrito: true },
  });

  if (!carrito) {
    return {
      id_carrito: null,
      id_cliente: idCliente,
      items: [],
      resumen: { subtotal: 0, descuento_total: 0, total: 0, cantidad_items: 0 },
    };
  }

  return buildCarritoResponse(carrito.id_carrito, idCliente);
}

export async function agregarItem(idCliente: number, data: AgregarItemInput) {
  const variante = await getVarianteConProducto(data.id_variante);
  const stockActual = variante.var_saldo_final ?? 0;

  const { id_carrito } = await getOrCreateCarrito(idCliente);

  // Verificar si ya existe el item para sumar cantidad
  const itemExistente = await prisma.carrito_detalle.findUnique({
    where: {
      id_carrito_id_variante: { id_carrito, id_variante: data.id_variante },
    },
    select: { id_carrito_det: true, cantidad: true },
  });

  const nuevaCantidad = (itemExistente?.cantidad ?? 0) + data.cantidad;

  if (nuevaCantidad > stockActual) {
    throw new ConflictError(
      `Stock insuficiente. Disponible: ${stockActual}, solicitado: ${nuevaCantidad}`
    );
  }

  if (itemExistente) {
    await prisma.carrito_detalle.update({
      where: { id_carrito_det: itemExistente.id_carrito_det },
      data: { cantidad: nuevaCantidad },
    });
  } else {
    await prisma.carrito_detalle.create({
      data: {
        id_carrito,
        id_variante: data.id_variante,
        cantidad: data.cantidad,
      },
    });
  }

  // Actualizar timestamp del carrito
  await prisma.carrito.update({
    where: { id_carrito },
    data: { updated_at: new Date() },
  });

  return buildCarritoResponse(id_carrito, idCliente);
}

export async function actualizarCantidad(
  idCliente: number,
  idCarritoDet: number,
  data: ActualizarCantidadInput
) {
  // Verificar que el item pertenece al carrito del cliente
  const item = await prisma.carrito_detalle.findFirst({
    where: {
      id_carrito_det: idCarritoDet,
      carrito: { id_cliente: idCliente },
    },
    include: {
      variante_producto: { select: { var_saldo_final: true } },
      carrito: { select: { id_carrito: true } },
    },
  });

  if (!item) throw new NotFoundError('Item del carrito no encontrado');

  // Si cantidad <= 0 → eliminar
  if (data.cantidad <= 0) {
    await prisma.carrito_detalle.delete({ where: { id_carrito_det: idCarritoDet } });
    await prisma.carrito.update({
      where: { id_carrito: item.carrito.id_carrito },
      data: { updated_at: new Date() },
    });
    return buildCarritoResponse(item.carrito.id_carrito, idCliente);
  }

  const stockActual = item.variante_producto.var_saldo_final ?? 0;
  if (data.cantidad > stockActual) {
    throw new ConflictError(
      `Stock insuficiente. Disponible: ${stockActual}, solicitado: ${data.cantidad}`
    );
  }

  await prisma.carrito_detalle.update({
    where: { id_carrito_det: idCarritoDet },
    data: { cantidad: data.cantidad },
  });

  await prisma.carrito.update({
    where: { id_carrito: item.carrito.id_carrito },
    data: { updated_at: new Date() },
  });

  return buildCarritoResponse(item.carrito.id_carrito, idCliente);
}

export async function quitarItem(idCliente: number, idCarritoDet: number) {
  const item = await prisma.carrito_detalle.findFirst({
    where: {
      id_carrito_det: idCarritoDet,
      carrito: { id_cliente: idCliente },
    },
    include: { carrito: { select: { id_carrito: true } } },
  });

  if (!item) throw new NotFoundError('Item del carrito no encontrado');

  // DELETE FÍSICO — carrito_detalle es volátil
  await prisma.carrito_detalle.delete({ where: { id_carrito_det: idCarritoDet } });

  await prisma.carrito.update({
    where: { id_carrito: item.carrito.id_carrito },
    data: { updated_at: new Date() },
  });

  return buildCarritoResponse(item.carrito.id_carrito, idCliente);
}

export async function vaciarCarrito(idCliente: number) {
  const carrito = await prisma.carrito.findUnique({
    where: { id_cliente: idCliente },
    select: { id_carrito: true },
  });

  if (!carrito) {
    return { id_carrito: null, id_cliente: idCliente, items: [], resumen: { subtotal: 0, descuento_total: 0, total: 0, cantidad_items: 0 } };
  }

  // DELETE FÍSICO de todos los detalles — el carrito persiste
  await prisma.carrito_detalle.deleteMany({
    where: { id_carrito: carrito.id_carrito },
  });

  await prisma.carrito.update({
    where: { id_carrito: carrito.id_carrito },
    data: { updated_at: new Date() },
  });

  return buildCarritoResponse(carrito.id_carrito, idCliente);
}

export async function validarCarrito(idCliente: number) {
  const carrito = await prisma.carrito.findUnique({
    where: { id_cliente: idCliente },
    include: {
      carrito_detalle: {
        include: {
          variante_producto: {
            include: {
              producto: {
                select: {
                  id_producto: true,
                  nombre: true,
                  precio_venta: true,
                  estado_prod: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!carrito || carrito.carrito_detalle.length === 0) {
    return { valido: false, problemas: [{ id_item: null, motivo: 'CARRITO_VACIO', detalle: 'El carrito no tiene items' }] };
  }

  const problemas: Array<{ id_item: number | null; motivo: string; detalle: string; precio_nuevo?: number }> = [];

  for (const det of carrito.carrito_detalle) {
    const v = det.variante_producto;
    const p = v.producto;

    // Producto inactivo
    if (p.estado_prod !== 'ACT') {
      problemas.push({
        id_item: det.id_carrito_det,
        motivo: 'PRODUCTO_INACTIVO',
        detalle: `El producto "${p.nombre}" ya no está disponible`,
      });
      continue;
    }

    // Stock insuficiente
    const stock = v.var_saldo_final ?? 0;
    if (stock < det.cantidad) {
      problemas.push({
        id_item: det.id_carrito_det,
        motivo: 'STOCK_INSUFICIENTE',
        detalle: `Solo hay ${stock} unidades disponibles de SKU ${v.sku} (tenés ${det.cantidad} en carrito)`,
      });
    }
  }

  return {
    valido: problemas.length === 0,
    problemas,
  };
}
