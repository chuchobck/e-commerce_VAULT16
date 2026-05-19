// ─── Tipos de contexto ────────────────────────────────────────────────────────

export interface ProductoContext {
  nombre: string;
  categoria: string;
  colores: string[];
  tallas: string[];
  precio: number;
}

// ─── Prompts versionados ──────────────────────────────────────────────────────

export const PROMPT_DESCRIPCION_PRODUCTO_V1 = {
  version: 'v1',
  modelo: 'claude-sonnet-4-5',
  system: `Eres copywriter de VORTEX, una tienda streetwear urbana ecuatoriana.
Tono: cercano, directo, urbano. Español ecuatoriano neutro.
Devuelves SOLO JSON válido sin markdown:
{
  "descripcion": string (200-300 palabras),
  "bullets": string[5],
  "tags": string[3-5]
}`,
  buildUserMessage: (producto: ProductoContext): string =>
    `Producto: ${producto.nombre}
Categoría: ${producto.categoria}
Colores: ${producto.colores.join(', ')}
Tallas: ${producto.tallas.join(', ')}
Precio: $${producto.precio}

Generá el JSON.`.trim(),
};
