import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { NotFoundError, ConflictError, ForbiddenError } from '@/shared/utils/errors';
import { registrarAudit } from '@/shared/utils/audit';
import { getDescuentoActivoProducto } from '@/shared/utils/promocionesHelper';
import { generarIdFactura } from '@/shared/utils/facturaNumber';
import { createOrder, captureOrder } from '@/modules/pagos/paypal.service';
import {
  PreviewInput,
  IniciarPagoInput,
  CapturarPayPalInput,
  ConfirmarTarjetaSimuladaInput,
} from './checkout.schemas';

// ─── Tipos internos ────────────────────────────────────────────────────────────

interface ItemCarrito {
  id_carrito_det: number;
  id_variante: number;
  cantidad: number;
  variante_producto: {
    var_saldo_final: number | null;
    color: string;
    sku: string;
    producto: {
      id_producto: string;
      nombre: string;
      precio_venta: Prisma.Decimal;
      estado_prod: string;
      producto_fotos: { url_foto: string }[];
    };
    talla: { descripcion: string };
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

export type MetodoPagoBD = 'PAYPAL' | 'TARJETA' | 'TRANSFERENCIA';

export interface ConfirmarPayload {
  id_cliente: number;
  id_direccion_envio: number;
  metodo_pago: MetodoPagoBD;
  referencia_externa?: string | null;
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
    const v = det.variante_producto;
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
      const v = det.variante_producto;
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

async function calcularTotales(idCliente: number) {
  const carrito = await getCarritoConItems(idCliente);
  if (!carrito || carrito.carrito_detalle.length === 0) {
    throw new ConflictError('El carrito está vacío');
  }
  const items = carrito.carrito_detalle as unknown as ItemCarrito[];
  await validarItems(items);
  const itemsCalc = await calcularItems(items);
  const subtotal = itemsCalc.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
  const descuento = itemsCalc.reduce((s, i) => s + i.descuento_item, 0);
  // IVA Ecuador 15% incluido en el precio_venta (B2C). Lo desglosamos para la UI.
  const total = subtotal - descuento;
  const baseImponible = total / 1.15;
  const iva = total - baseImponible;
  return { carrito, items, itemsCalc, subtotal, descuento, total, baseImponible, iva };
}

// ─── Preview ───────────────────────────────────────────────────────────────────

export async function preview(idCliente: number, data: PreviewInput) {
  await getCliente(idCliente);
  const direccion = await getDireccion(data.id_direccion_envio, idCliente);
  const { itemsCalc, subtotal, descuento, total, baseImponible, iva } =
    await calcularTotales(idCliente);

  return {
    items: itemsCalc,
    subtotal,
    descuento_total: descuento,
    base_imponible: baseImponible,
    iva_porcentaje: 15,
    iva,
    total,
    direccion,
  };
}

// ─── Confirmar (transacción principal) ─────────────────────────────────────────

export async function confirmar(payload: ConfirmarPayload) {
  const { id_cliente, id_direccion_envio, metodo_pago, referencia_externa, estado_pago } = payload;

  const { carrito, items: itemsRaw, itemsCalc, subtotal, descuento, total } =
    await calcularTotales(id_cliente);

  const factura = await prisma.$transaction(
    async (tx) => {
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

      const idFactura = await generarIdFactura(tx);

      const nuevaFactura = await tx.factura.create({
        data: {
          id_factura: idFactura,
          id_cliente,
          id_direccion_envio,
          subtotal: new Prisma.Decimal(subtotal.toFixed(3)),
          descuento_total: new Prisma.Decimal(descuento.toFixed(3)),
          total: new Prisma.Decimal(total.toFixed(3)),
          estado: 'EMI',
        },
      });

      for (const item of itemsCalc) {
        const stockActual = stockMap.get(item.id_variante) ?? 0;
        const nuevoSaldo = stockActual - item.cantidad;

        await tx.detalle_factura.create({
          data: {
            id_factura: idFactura,
            id_variante: item.id_variante,
            cantidad: item.cantidad,
            precio_unitario: new Prisma.Decimal(item.precio_unitario.toFixed(3)),
            descuento_item: new Prisma.Decimal(item.descuento_item.toFixed(3)),
          },
        });

        await tx.variante_producto.update({
          where: { id_variante: item.id_variante },
          data: { var_qty_egresos: { increment: item.cantidad } },
        });

        await tx.movimiento_stock.create({
          data: {
            id_variante: item.id_variante,
            tipo: 'EGR',
            cantidad: item.cantidad,
            referencia: `FAC-${idFactura}`.slice(0, 20),
            saldo_post: nuevoSaldo,
            observacion: `Venta factura ${idFactura}`,
          },
        });
      }

      await tx.pago.create({
        data: {
          id_factura: idFactura,
          metodo: metodo_pago,
          monto: new Prisma.Decimal(total.toFixed(3)),
          referencia_externa: referencia_externa ?? null,
          estado: estado_pago,
        },
      });

      if (estado_pago === 'COM') {
        await tx.factura.update({
          where: { id_factura: idFactura },
          data: { estado: 'PAG' },
        });
      }

      await tx.carrito_detalle.deleteMany({
        where: { id_carrito: carrito.id_carrito },
      });

      return nuevaFactura;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );

  await registrarAudit({
    tabla: 'factura',
    id_registro: factura.id_factura,
    accion: 'INSERT',
    payload_despues: {
      id_cliente,
      metodo_pago,
      total,
      estado: factura.estado,
      items: itemsCalc.map((i) => ({ id_variante: i.id_variante, cantidad: i.cantidad })),
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

  if (data.metodo_pago === 'PAYPAL') {
    const { total } = await calcularTotales(idCliente);
    const order = await createOrder(total, {
      id_cliente: idCliente,
      id_direccion_envio: data.id_direccion_envio,
    });
    return {
      metodo: 'PAYPAL' as const,
      paypal_order_id: order.id,
      paypal_status: order.status,
      paypal_stub: order.stub,
      total,
    };
  }

  if (data.metodo_pago === 'TARJETA') {
    // Tarjeta simulada: ningún dato de tarjeta llega al backend.
    // El frontend muestra el formulario visual y luego llama /capturar-tarjeta.
    const { total } = await calcularTotales(idCliente);
    return {
      metodo: 'TARJETA' as const,
      total,
    };
  }

  // TRANSFERENCIA → confirmar directamente como PEN
  const resultado = await confirmar({
    id_cliente: idCliente,
    id_direccion_envio: data.id_direccion_envio,
    metodo_pago: 'TRANSFERENCIA',
    estado_pago: 'PEN',
  });

  return {
    metodo: 'TRANSFERENCIA' as const,
    id_factura: resultado.id_factura,
    total: resultado.total,
    estado: resultado.estado,
    instrucciones_transferencia: {
      banco: 'Banco Pichincha',
      cuenta: '2200123456',
      tipo: 'Corriente',
      beneficiario: 'VAULT 16 S.A.',
      ruc: '1791234567001',
      referencia: resultado.id_factura,
    },
  };
}

// ─── Capturar pago PayPal ──────────────────────────────────────────────────────

export async function capturarPayPal(idCliente: number, data: CapturarPayPalInput) {
  await getCliente(idCliente);
  await getDireccion(data.id_direccion_envio, idCliente);

  // Recalculamos el total del carrito ANTES de capturar.
  const { total } = await calcularTotales(idCliente);
  const expectedCustomId = `${idCliente}:${data.id_direccion_envio}`;

  const captura = await captureOrder(data.paypal_order_id);

  if (captura.status !== 'COMPLETED') {
    throw new ConflictError(`Pago PayPal no completado (status: ${captura.status})`);
  }

  // ── Verificaciones de integridad (fail-closed en modo real) ───────────
  if (!captura.stub) {
    if (!captura.currencyCode || captura.currencyCode !== 'USD') {
      throw new ConflictError(
        `Moneda PayPal inválida o ausente: ${captura.currencyCode ?? 'null'} (esperado USD)`,
      );
    }
    if (!captura.amountValue || Number(captura.amountValue).toFixed(2) !== total.toFixed(2)) {
      throw new ConflictError(
        `Monto PayPal (${captura.amountValue ?? 'null'}) no coincide con el total del carrito (${total.toFixed(2)})`,
      );
    }
    if (!captura.customId || captura.customId !== expectedCustomId) {
      throw new ConflictError(
        `Orden PayPal no pertenece a este cliente/dirección (custom_id mismatch o ausente)`,
      );
    }
  }

  // ── Idempotencia: si ya procesamos esta orden/captura, devolver la factura existente ──
  const refId = captura.captureId ?? captura.id;
  const yaProcesado = await prisma.pago.findFirst({
    where: { referencia_externa: refId, metodo: 'PAYPAL' },
    select: {
      id_factura: true,
      factura: { select: { total: true, estado: true, fecha_emision: true } },
    },
  });
  if (yaProcesado) {
    return {
      id_factura: yaProcesado.id_factura,
      total: Number(yaProcesado.factura.total),
      estado: yaProcesado.factura.estado,
      fecha_emision: yaProcesado.factura.fecha_emision,
      paypal: {
        order_id: captura.id,
        capture_id: captura.captureId,
        payer_email: captura.payerEmail,
        stub: captura.stub,
        idempotent_replay: true,
      },
    };
  }

  const resultado = await confirmar({
    id_cliente: idCliente,
    id_direccion_envio: data.id_direccion_envio,
    metodo_pago: 'PAYPAL',
    referencia_externa: refId,
    estado_pago: 'COM',
  });

  return {
    ...resultado,
    paypal: {
      order_id: captura.id,
      capture_id: captura.captureId,
      payer_email: captura.payerEmail,
      stub: captura.stub,
    },
  };
}

// ─── Confirmar tarjeta simulada ────────────────────────────────────────────────

export async function confirmarTarjetaSimulada(
  idCliente: number,
  data: ConfirmarTarjetaSimuladaInput,
) {
  await getCliente(idCliente);
  await getDireccion(data.id_direccion_envio, idCliente);

  const resultado = await confirmar({
    id_cliente: idCliente,
    id_direccion_envio: data.id_direccion_envio,
    metodo_pago: 'TARJETA',
    referencia_externa: `SIM-${Date.now()}`,
    estado_pago: 'COM',
  });

  return resultado;
}
