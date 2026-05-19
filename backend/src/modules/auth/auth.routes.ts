import { Router } from 'express';
import { validateRequest } from '@/middleware/validateRequest';
import { authRateLimit } from '@/middleware/rateLimit';
import {
  LoginBackofficeSchema,
  LoginClienteSchema,
  RegisterClienteSchema,
  VerifyEmailParamSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from './auth.schemas';
import * as authController from './auth.controller';

export const authRouter = Router();

// Rate limit estricto en todos los endpoints de login/register
authRouter.post(
  '/login-backoffice',
  authRateLimit,
  validateRequest({ body: LoginBackofficeSchema }),
  authController.loginBackoffice,
);

authRouter.post(
  '/login-cliente',
  authRateLimit,
  validateRequest({ body: LoginClienteSchema }),
  authController.loginCliente,
);

authRouter.post(
  '/register-cliente',
  authRateLimit,
  validateRequest({ body: RegisterClienteSchema }),
  authController.registerCliente,
);

authRouter.get(
  '/verify-email/:token',
  validateRequest({ params: VerifyEmailParamSchema }),
  authController.verifyEmail,
);

authRouter.post(
  '/forgot-password-cliente',
  authRateLimit,
  validateRequest({ body: ForgotPasswordSchema }),
  authController.forgotPassword,
);

authRouter.post(
  '/reset-password-cliente',
  validateRequest({ body: ResetPasswordSchema }),
  authController.resetPassword,
);
