import type { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';

export async function loginBackoffice(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.loginBackoffice(req.body, {
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function loginCliente(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.loginCliente(req.body, {
      ip: req.ip,
      user_agent: req.headers['user-agent'],
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function registerCliente(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.registerCliente(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.verifyEmail(req.params.token);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.resetPassword(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
