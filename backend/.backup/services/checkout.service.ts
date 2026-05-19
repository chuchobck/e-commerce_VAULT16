import { prisma } from '../config/prisma';
import { BadRequestError, NotFoundError, UnprocessableError } from '../shared/utils/errors';
import { FACTURA_EMITIDA, MOV_SALIDA, PAGO_PENDIENTE, PROMO_PORCENTAJE } from '../shared/constants/estados';
import { CheckoutDto } from '../schemas/checkout.schemas';

export async function procesarCheckout(clienteId: number, dto: CheckoutDto) {
  // 1. Obtener carrito activo con items
  const carrito = await prisma.carrito.findFirst({
    where: { clienteId, activo: true },
    include: {
      items: {
        include: {
          variante: { include: { producto: { select: { id: true, precio: true } } } },
        },
      },
    },
  });

  if (!carrito || carrito.items.length === 0) {
    throw new BadRequestError('El carrito está vacío');
  }

  // 2. Validar dirección pertenece al cliente
  const direccion = await prisma.direccion.findFirst({ where: { id: dto.direccionId, clienteId } });
  if (!direccion) throw new NotFoundError('Dirección no encontrada');

  // 3. Validar stock de cada item
  for (const item of carrito.items) {
    if (item.variante.stock < item.cantidad) {
      throw new UnprocessableError(
        `Stock insuficiente para SKU ${item.variante.sku}. Disponible: ${item.variante.stock}`,
      );
    }
  }

  // 4. Calcular montos
  let subtotal = carrito.items.reduce(
    (sum, item) => sum + Number(item.variante.producto.precio) * item.cantidad,
    0,
  );

  let descuento = 0;
  let promocionId: number | undefined;

  if (dto.codigoPromocion) {
    const now = new Date();
    const promo = await prisma.promocion.findFirst({
      where: { codigo: dto.codigoPromocion, activa: true, fechaInicio: { lte: now }, fechaFin: { gte: now } },
    });
    if (!promo) throw new BadRequestError('Código de promoción no válido o expirado');
    if (promo.usoMaximo && promo.usoActual >= promo.usoMaximo) throw new BadRequestError('Código agotado');

    descuento =
      promo.tipo === PROMO_PORCENTAJE
        ? subtotal * (Number(promo.valor) / 100)
        : Math.min(Number(promo.valor), subtotal);

    promocionId = promo.id;
  }

  const base = subtotal - descuento;
  const IVA = 0.16;
  const impuestos = base * IVA;
  const total = base + impuestos;

  // 5. Ejecutar en una transacción atómica
  const factura = await prisma.$transaction(async (tx) => {
    // Crear factura
    const nuevaFactura = await tx.factura.create({
      data: {
        clienteId,
        direccionId: dto.direccionId,
        estado: FACTURA_EMITIDA,
        subtotal,
        descuento,
        impuestos,
        total,
        notas: dto.notas,
        items: {
          create: carrito.items.map((item) => ({
            varianteId: item.varianteId,
            cantidad: item.cantidad,
            precioUnit: item.variante.producto.precio,
            subtotal: Number(item.variante.producto.precio) * item.cantidad,
          })),
        },
        ...(promocionId && { promociones: { create: [{ promocionId }] } }),
      },
      include: { items: true },
    });

    // Descontar stock + registrar movimientos
    for (const item of carrito.items) {
      await tx.variante.update({
        where: { id: item.varianteId },
        data: { stock: { decrement: item.cantidad } },
      });

      await tx.movimientoStock.create({
        data: {
          varianteId: item.varianteId,
          tipo: MOV_SALIDA,
          cantidad: item.cantidad,
          motivo: `Venta - Factura #${nuevaFactura.id}`,
          facturaId: nuevaFactura.id,
        },
      });
    }

    // Crear pago pendiente
    await tx.pago.create({
      data: {
        facturaId: nuevaFactura.id,
        monto: total,
        estado: PAGO_PENDIENTE,
      },
    });

    // Incrementar uso de promoción
    if (promocionId) {
      await tx.promocion.update({ where: { id: promocionId }, data: { usoActual: { increment: 1 } } });
    }

    // Cerrar carrito
    await tx.carrito.update({ where: { id: carrito.id }, data: { activo: false } });

    return nuevaFactura;
  });

  // 6. Retornar factura con detalle completo
  return prisma.factura.findUnique({
    where: { id: factura.id },
    include: {
      items: { include: { variante: { include: { producto: { select: { id: true, nombre: true } }, talla: true } } } },
      direccion: true,
      pagos: true,
    },
  });
}
