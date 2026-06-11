import { prisma } from '../../config/prisma';

export type AuditAccion = 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';

export interface AuditParams {
  tabla: string;
  id_registro: string | number;
  accion: AuditAccion;
  payload_antes?: object | null;
  payload_despues?: object | null;
  id_usuario_bo?: number | null;
  id_cliente?: number | null;
  ip?: string;
  user_agent?: string;
}

/**
 * Registra un evento en audit_log.
 * NUNCA tira excepción — si falla, solo loguea el error.
 */
export async function registrarAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.audit_log.create({
      data: {
        tabla: params.tabla,
        id_registro: String(params.id_registro),
        accion: params.accion,
        payload_antes: params.payload_antes ?? undefined,
        payload_despues: params.payload_despues ?? undefined,
        id_usuario_bo: params.id_usuario_bo ?? null,
        id_cliente: params.id_cliente ?? null,
        ip: params.ip ?? null,
        user_agent: params.user_agent ?? null,
      },
    });
  } catch (err) {
    // Auditoría nunca interrumpe el flujo de negocio
    console.error('[AUDIT ERROR]', err);
  }
}
