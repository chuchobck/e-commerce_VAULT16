import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { NotFoundError, ConflictError, ForbiddenError } from '@/shared/utils/errors';
import { registrarAudit } from '@/shared/utils/audit';
import { getDescuentoActivoProducto } from '@/shared/utils/promocionesHelper';
import { generarIdFactura } from '@/shared/utils/facturaNumber';
import { createPaymentIntent } from '@/modules/pagos/stripe.service';
import { PreviewInput, IniciarPagoInput } from './checkout.schemas';

// ─── Tipos internos ────────────────────────────────────────────────────────────

interface ItemCarrito {
  id_carrito_det: number;
  id_variante: number;
  cantidad: number;
  variante: {
    var_saldo_final: number | null;
    producto: {
      id_producto: string;
      nombre: string;
      precio_venta: Prisma.Decimal;
      estado_prod: string;
      producto_fotos: { url_foto: string }[];
    };
    talla: { descripcion: string };
    color: string;
    sku: string;
  };
}

interface ItemCalculado {
  id_variante: number;
  cantidad: number;
  precio_unitario: number;
  descuento_pct: number;
  descuento_item: number;
  subtotal_linea: number;
  producto: {
    id: string;
    nombre: string;
    foto_principal: string | null;
  };
  variante: {
    color: string;
    talla: string;
    sku: string;
  };
}

export interface ConfirmarPayload {
  id_cliente: number;
  id_direccion_envio: number;
  metodo_pago: 'STRIPE' | 'TRANSFERENCIA';
  referencia_externa?: string;
  estado_pago: 'COM' | 'PEN';
}

// ─── Helpers privados ──────────────────────────────────────────────────────────

async function getCarritoConItems(idCliente: number) {
  return prisma.carrito.findUnique({
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
      },
    },
  });
}

async function validarItems(items: ItemCarrito[]) {
  for (const det of items) {
    const v = det.variante;
    const p = v.producto;
    if (p.estado_prod !== 'ACT') {
      throw new ConflictError(`El producto "${p.nombre}" no está disponible`);
    }
    const stock = v.var_saldo_final ?? 0;
    if (stock < det.cantidad) {
      throw new ConflictError(
        `Stock insuficiente para SKU ${v.sku}. Disponible: ${stock}, solicitado: ${det.cantidad}`
      );
    }
  }
}

async function calcularItems(items: ItemCarrito[]): Promise<ItemCalculado[]> {
  return Promise.all(
    items.map(async (det) => {
      const v = det.variante;
      const p = v.producto;
      const precioUnitario = Number(p.precio_venta);
      const descuentoPct = await getDescuentoActivoProducto(p.id_producto);
      const subtotalBruto = det.cantidad * precioUnitario;
      const descuentoItem = subtotalBruto * (descuentoPct / 100);
      const subtotalLinea = subtotalBruto - descuentoItem;
      return {
        id_variante: det.id_variante,
        cantidad: det.cantidad,
        precio_unitario: precioUnitario,
        descuento_pct: descuentoPct,
        descuento_item: descuentoItem,
        subtotal_linea: subtotalLinea,
        producto: {
          id: p.id_producto,
          nombre: p.nombre,
          foto_principal: p.producto_fotos[0]?.url_foto ?? null,
        },
        variante: {
          color: v.color,
          talla: v.talla.descripcion,
          sku: v.sku,
        },
      };
    })
  );
}

async function getDireccion(idDireccion: number, idCliente: number) {
  const dir = await prisma.direccion_cliente.findFirst({
    where: { id_direccion: idDireccion, id_cliente: idCliente, activa: true },
  });
  if (!dir) throw new NotFoundError('Dirección de envío no encontrada o inactiva');
  return dir;
}

async function getCliente(idCliente: number) {
  const cliente = await prisma.cliente.findUnique({
    where: { id_cliente: idCliente },
    select: { id_cliente: true, email_verificado: true, nombre1: true, apellido1: true, email: true },
  });
  if (!cliente) throw new NotFoundError('Cliente no encontrado');
  if (!cliente.email_verificado) {
    throw new ForbiddenError('Debes verificar tu email antes de realizar una compra');
  }
  return cliente;
}

// ─── Preview ───────────────────────────────────────────────────────────────────

export async function preview(idCliente: number, data: PreviewInput) {
  await getCliente(idCliente);
  const direccion = await getDireccion(data.id_direccion_envio, idCliente);

  const carrito = await getCarritoConItems(idCliente);
  if (!carrito || carrito.carrito_detalle.length === 0) {
    throw new ConflictError('El carrito está vacío');
  }

  const items = carrito.carrito_detalle as unknown as ItemCarrito[];
  await validarItems(items);
  const itemsCalculados = await calcularItems(items);

  const subtotal = itemsCalculados.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
  const descuento_total = itemsCalculados.reduce((s, i) => s + i.descuento_item, 0);
  const total = subtotal - descuento_total;

  return { items: itemsCalculados, subtotal, descuento_total, total, direccion };
}

// ─── Transacción principal ─────────────────────────────────────────────────────

export async function confirmar(payload: ConfirmarPayload) {
  const { id_cliente, id_direccion_envio, metodo_pago, referencia_externa, estado_pago } = payload;

  const carrito = await getCarritoConItems(id_cliente);
  if (!carrito || carrito.carrito_detalle.length === 0) {
    throw new ConflictError('El carrito está vacío');
  }

  const itemsRaw = carrito.carrito_detalle as unknown as ItemCarrito[];
  const itemsCalculados = await calcularItems(itemsRaw);

  const subtotal = itemsCalculados.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
  const descuento_total = itemsCalculados.reduce((s, i) => s + i.descuento_item, 0);
  const total = subtotal - descuento_total;

  const factura = await prisma.$transaction(
    async (tx) => {
      // 1. Bloquear filas de variantes y re-validar stock (SELECT ... FOR UPDATE)
      const idVariantes = itemsRaw.map((i) => i.id_variante);
      const variantesLocked = await tx.$queryRaw<
        { id_variante: number; var_saldo_final: number }[]
      >`
        SELECT id_variante, var_saldo_final
        FROM vortex.variante_producto
        WHERE id_variante = ANY(${idVariantes}::int[])
        FOR UPDATE
      `;

      const stockMap = new Map(variantesLocked.map((v) => [v.id_variante, v.var_saldo_final]));

      for (const item of itemsRaw) {
        const stock = stockMap.get(item.id_variante) ?? 0;
        if (stock < item.cantidad) {
          throw new ConflictError(
            `Stock insuficiente para variante ${item.id_variante}. Disponible: ${stock}, solicitado: ${item.cantidad}`
          );
        }
      }

      // 2. Generar id_factura dentro de la transacción (con lock)
      const idFactura = await generarIdFactura(tx);

      // 3. INSERT factura
      const nuevaFactura = await tx.factura.create({
        data: {
          id_factura: idFactura,
          id_cliente,
          id_direccion_envio,
          subtotal: new Prisma.Decimal(subtotal.toFixed(3)),
          descuento_total: new Prisma.Decimal(descuento_total.toFixed(3)),
          total: new Prisma.Decimal(total.toFixed(3)),
          estado: 'EMI',
        },
      });

      // 4. Para cada item: detalle + stock update + movimiento
      for (const item of itemsCalculados) {
        const stockActual = stockMap.get(item.id_variante) ?? 0;
        const nuevoSaldo = stockActual - item.cantidad;

        // a. INSERT detalle_factura (SNAPSHOT de precio)
        await tx.detalle_factura.create({
          data: {
            id_factura: idFactura,
            id_variante: item.id_variante,
            cantidad: item.cantidad,
            precio_unitario: new Prisma.Decimal(item.precio_unitario.toFixed(3)),
            descuento_item: new Prisma.Decimal(item.descuento_item.toFixed(3)),
          },
        });

        // b. UPDATE var_qty_egresos += cantidad
        await tx.variante_producto.update({
          where: { id_variante: item.id_variante },
          data: { var_qty_egresos: { increment: item.cantidad } },
        });

        // c. INSERT movimiento_stock
        await tx.movimiento_stock.create({
          data: {
            id_variante: item.id_variante,
            tipo: 'EGR',
            cantidad: item.cantidad,
            referencia: `FAC-${idFactura}`,
            saldo_post: nuevoSaldo,
            observacion: `Venta factura ${idFactura}`,
          },
        });
      }

      // 5. INSERT pago
      await tx.pago.create({
        data: {
          id_factura: idFactura,
          metodo: metodo_pago,
          monto: new Prisma.Decimal(total.toFixed(3)),
          referencia_externa: referencia_externa ?? null,
          estado: estado_pago,
        },
      });

      // 6. Si pago confirmado → factura pasa a PAG
      if (estado_pago === 'COM') {
        await tx.factura.update({
          where: { id_factura: idFactura },
          data: { estado: 'PAG' },
        });
      }

      // 7. Vaciar carrito (DELETE FÍSICO de detalles)
      await tx.carrito_detalle.deleteMany({
        where: { id_carrito: carrito.id_carrito },
      });

      return nuevaFactura;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );

  // 8. Auditoría (fuera de tx — nunca rompe el flujo)
  await registrarAudit({
    tabla: 'factura',
    id_registro: factura.id_factura,
    accion: 'INSERT',
    payload_despues: {
      id_cliente,
      metodo_pago,
      total,
      estado: factura.estado,
      items: itemsCalculados.map((i) => ({ id_variante: i.id_variante, cantidad: i.cantidad })),
    },
    id_cliente,
  });

  return {
    id_factura: factura.id_factura,
    total,
    estado: factura.estado,
    fecha_emision: factura.fecha_emision,
  };
}

// ─── Iniciar pago ──────────────────────────────────────────────────────────────

export async function iniciarPago(idCliente: number, data: IniciarPagoInput) {
  await getCliente(idCliente);
  await getDireccion(data.id_direccion_envio, idCliente);

  const carrito = await getCarritoConItems(idCliente);
  if (!carrito || carrito.carrito_detalle.length === 0) {
    throw new ConflictError('El carrito está vacío');
  }

  const itemsRaw = carrito.carrito_detalle as unknown as ItemCarrito[];
  await validarItems(itemsRaw);

  if (data.metodo_pago === 'STRIPE') {
    const itemsCalculados = await calcularItems(itemsRaw);
    const total = itemsCalculados.reduce((s, i) => s + i.subtotal_linea, 0);

    const intent = await createPaymentIntent(total, {
      id_cliente: String(idCliente),
      id_direccion_envio: String(data.id_direccion_envio),
    });

    return {
      metodo: 'STRIPE',
      client_secret: intent.client_secret,
      idempotency_key: intent.id,
    };
  }

  // TRANSFERENCIA → confirmar directamente
  const resultado = await confirmar({
    id_cliente: idCliente,
    id_direccion_envio: data.id_direccion_envio,
    metodo_pago: 'TRANSFERENCIA',
    estado_pago: 'PEN',
  });

  return {
    metodo: 'TRANSFERENCIA',
    id_factura: resultado.id_factura,
    total: resultado.total,
    estado: resultado.estado,
    instrucciones_transferencia: {
      banco: 'Banco Pichincha',
      cuenta: '2200123456',
      tipo: 'Corriente',
      beneficiario: 'VORTEX S.A.',
      ruc: '1791234567001',
      referencia: resultado.id_factura,
    },
  };
}
