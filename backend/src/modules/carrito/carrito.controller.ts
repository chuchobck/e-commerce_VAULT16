import { Request, Response, NextFunction } from 'express';
import * as service from './carrito.service';

export async function getCarrito(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const data = await service.getCarrito(idCliente);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function agregarItem(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const data = await service.agregarItem(idCliente, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function actualizarCantidad(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const idCarritoDet = parseInt(req.params.id, 10);
    const data = await service.actualizarCantidad(idCliente, idCarritoDet, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function quitarItem(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const idCarritoDet = parseInt(req.params.id, 10);
    const data = await service.quitarItem(idCliente, idCarritoDet);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function vaciarCarrito(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const data = await service.vaciarCarrito(idCliente);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function validarCarrito(req: Request, res: Response, next: NextFunction) {
  try {
    const idCliente = req.cliente!.id;
    const data = await service.validarCarrito(idCliente);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
