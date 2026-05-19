export const ROL_ADMIN = 'ADMIN';
export const ROL_VENDEDOR = 'VENDEDOR';
export const ROL_ALMACENISTA = 'ALMACENISTA';

export const ROLES_BACKOFFICE = [ROL_ADMIN, ROL_VENDEDOR, ROL_ALMACENISTA] as const;
export type RolBackoffice = (typeof ROLES_BACKOFFICE)[number];
