// Prompts versionados para generación de contenido IA

export const DESCRIPCION_PRODUCTO_PROMPT = (producto: {
  nombre: string;
  categoria: string;
  precio: number;
  tallas: string[];
  colores: string[];
}) => `Eres un copywriter experto en moda urbana para la tienda VAULT_16.
Escribe una descripción de producto atractiva, moderna y concisa (máximo 150 palabras) para:

- Nombre: ${producto.nombre}
- Categoría: ${producto.categoria}
- Precio: $${producto.precio} MXN
- Tallas disponibles: ${producto.tallas.join(', ') || 'N/A'}
- Colores disponibles: ${producto.colores.join(', ') || 'N/A'}

La descripción debe:
1. Destacar el estilo y versatilidad de la prenda
2. Usar lenguaje fresco y directo, enfocado en jóvenes de 18-35 años
3. Incluir una llamada a la acción sutil al final
4. NO incluir precios ni disponibilidad de stock

Responde SOLO con la descripción, sin títulos ni explicaciones adicionales.`;

export const EMBEDDING_SEARCH_PROMPT = (query: string) =>
  `Consulta de búsqueda en tienda de moda urbana: ${query}`;
