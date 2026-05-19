import { prisma } from '@/config/prisma';
import { signToken } from '@/shared/utils/jwt';
import { hashPassword, comparePassword } from '@/shared/utils/password';
import { registrarAudit } from '@/shared/utils/audit';
import {
  ApiError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '@/shared/utils/errors';
import type {
  LoginBackofficeInput,
  LoginClienteInput,
  RegisterClienteInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.schemas';

// ─── Backoffice Login ─────────────────────────────────────────────────────────

export async function loginBackoffice(
  data: LoginBackofficeInput,
  meta: { ip?: string; user_agent?: string } = {},
) {
  const usuario = await prisma.usuarios_backoffice.findUnique({
    where: { email: data.email },
    include: { empleado: true, rol: true },
  });

  const credencialesInvalidas = () => {
    registrarAudit({
      tabla: 'usuarios_backoffice',
      id_registro: data.email,
      accion: 'LOGIN',
      payload_antes: { motivo: 'INVALID_CREDENTIALS' },
      ip: meta.ip,
      user_agent: meta.user_agent,
    }).catch(() => undefined);
    throw new UnauthorizedError('Credenciales inválidas');
  };

  if (!usuario) return credencialesInvalidas();
  if (usuario.empleado.estado_emp !== 'ACT') return credencialesInvalidas();

  const ok = await comparePassword(data.password, usuario.password_hash);
  if (!ok) return credencialesInvalidas();

  await prisma.usuarios_backoffice.update({
    where: { id_usuario: usuario.id_usuario },
    data: { ultimo_login: new Date() },
  });

  registrarAudit({
    tabla: 'usuarios_backoffice',
    id_registro: usuario.id_usuario,
    accion: 'LOGIN',
    payload_despues: { email: usuario.email },
    id_usuario_bo: usuario.id_usuario,
    ip: meta.ip,
    user_agent: meta.user_agent,
  }).catch(() => undefined);

  const token = signToken(
    { id: usuario.id_usuario, email: usuario.email, rol: usuario.rol.nombre },
    'backoffice',
  );

  return {
    user: {
      id_usuario: usuario.id_usuario,
      email: usuario.email,
      rol: usuario.rol.nombre,
      empleado: {
        nombre1: usuario.empleado.nombre1,
        apellido1: usuario.empleado.apellido1,
      },
    },
    token,
  };
}

// ─── Cliente Login ────────────────────────────────────────────────────────────

export async function loginCliente(
  data: LoginClienteInput,
  meta: { ip?: string; user_agent?: string } = {},
) {
  const cliente = await prisma.cliente.findUnique({ where: { email: data.email } });

  const credencialesInvalidas = () => {
    registrarAudit({
      tabla: 'cliente',
      id_registro: data.email,
      accion: 'LOGIN',
      payload_antes: { motivo: 'INVALID_CREDENTIALS' },
      ip: meta.ip,
      user_agent: meta.user_agent,
    }).catch(() => undefined);
    throw new UnauthorizedError('Credenciales inválidas');
  };

  if (!cliente) return credencialesInvalidas();
  if (cliente.estado !== 'ACT') return credencialesInvalidas();

  // Nota: ya NO bloqueamos por email_verificado. El cliente puede iniciar
  // sesión y comprar antes de verificar; el frontend muestra un banner
  // recordándole verificar el email.

  const ok = await comparePassword(data.password, cliente.password_hash);
  if (!ok) return credencialesInvalidas();

  await prisma.cliente.update({
    where: { id_cliente: cliente.id_cliente },
    data: { ultimo_login: new Date() },
  });

  registrarAudit({
    tabla: 'cliente',
    id_registro: cliente.id_cliente,
    accion: 'LOGIN',
    payload_despues: { email: cliente.email },
    id_cliente: cliente.id_cliente,
    ip: meta.ip,
    user_agent: meta.user_agent,
  }).catch(() => undefined);

  const token = signToken({ id: cliente.id_cliente, email: cliente.email }, 'cliente');

  return {
    cliente: {
      id_cliente: cliente.id_cliente,
      email: cliente.email,
      nombre1: cliente.nombre1,
      apellido1: cliente.apellido1,
      ruc_cedula: cliente.ruc_cedula,
      telefono: cliente.telefono,
      email_verificado: cliente.email_verificado,
    },
    token,
  };
}

// ─── Register Cliente ─────────────────────────────────────────────────────────

export async function registerCliente(data: RegisterClienteInput) {
  const emailExiste = await prisma.cliente.findUnique({ where: { email: data.email } });
  if (emailExiste) throw new ConflictError('El email ya está registrado');

  const rucExiste = await prisma.cliente.findUnique({
    where: { ruc_cedula: data.ruc_cedula },
  });
  if (rucExiste) throw new ConflictError('La cédula/RUC ya está registrada');

  const password_hash = await hashPassword(data.password);

  const cliente = await prisma.cliente.create({
    data: {
      email: data.email,
      password_hash,
      ruc_cedula: data.ruc_cedula,
      nombre1: data.nombre1,
      apellido1: data.apellido1,
      telefono: data.telefono,
      email_verificado: false,
      estado: 'ACT',
    },
  });

  // Generar token de verificación de email (expira en 24h)
  const expira = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tokenRow = await prisma.token_recuperacion.create({
    data: {
      id_cliente: cliente.id_cliente,
      tipo: 'EMAIL_VERIFY',
      expira,
    },
  });

  // TODO: enviar email de verificación — por ahora logueamos el link
  console.log(
    `[AUTH] Verificación email: GET /api/auth/verify-email/${tokenRow.id_token}`,
  );

  // Firmar JWT igual que en login, así el cliente queda logueado al instante
  // después del registro (y puede ir directo al checkout sin pasar por /login).
  const token = signToken(
    { id: cliente.id_cliente, email: cliente.email },
    'cliente',
  );

  return {
    cliente: {
      id_cliente: cliente.id_cliente,
      email: cliente.email,
      nombre1: cliente.nombre1,
      apellido1: cliente.apellido1,
      ruc_cedula: cliente.ruc_cedula,
      telefono: cliente.telefono,
      email_verificado: cliente.email_verificado,
    },
    token,
    message: 'Registro exitoso. Verificá tu email para activar la cuenta.',
  };
}

// ─── Verify Email ─────────────────────────────────────────────────────────────

export async function verifyEmail(tokenId: string) {
  const tokenRow = await prisma.token_recuperacion.findUnique({
    where: { id_token: tokenId },
  });

  if (
    !tokenRow ||
    tokenRow.tipo !== 'EMAIL_VERIFY' ||
    tokenRow.usado ||
    tokenRow.expira < new Date()
  ) {
    throw new ApiError(400, 'INVALID_TOKEN', 'Token inválido o expirado');
  }

  await prisma.$transaction([
    prisma.cliente.update({
      where: { id_cliente: tokenRow.id_cliente },
      data: { email_verificado: true },
    }),
    prisma.token_recuperacion.update({
      where: { id_token: tokenId },
      data: { usado: true },
    }),
  ]);

  return { message: 'Email verificado correctamente' };
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPassword(data: ForgotPasswordInput) {
  const cliente = await prisma.cliente.findUnique({ where: { email: data.email } });

  if (cliente) {
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1h
    const tokenRow = await prisma.token_recuperacion.create({
      data: {
        id_cliente: cliente.id_cliente,
        tipo: 'PASSWORD_RESET',
        expira,
      },
    });

    // TODO: enviar email con token
    console.log(
      `[AUTH] Reset password: POST /api/auth/reset-password-cliente con token=${tokenRow.id_token}`,
    );
  }

  // SIEMPRE responde igual para no filtrar si el email existe
  return { message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.' };
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPassword(data: ResetPasswordInput) {
  const tokenRow = await prisma.token_recuperacion.findUnique({
    where: { id_token: data.token },
  });

  if (
    !tokenRow ||
    tokenRow.tipo !== 'PASSWORD_RESET' ||
    tokenRow.usado ||
    tokenRow.expira < new Date()
  ) {
    throw new ApiError(400, 'INVALID_TOKEN', 'Token inválido o expirado');
  }

  const password_hash = await hashPassword(data.newPassword);

  await prisma.$transaction([
    prisma.cliente.update({
      where: { id_cliente: tokenRow.id_cliente },
      data: { password_hash },
    }),
    prisma.token_recuperacion.update({
      where: { id_token: data.token },
      data: { usado: true },
    }),
  ]);

  return { message: 'Contraseña actualizada correctamente' };
}
