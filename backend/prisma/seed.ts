import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ── Roles ────────────────────────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.rol.upsert({ where: { nombre: 'ADMIN' }, update: {}, create: { nombre: 'ADMIN' } }),
    prisma.rol.upsert({ where: { nombre: 'VENDEDOR' }, update: {}, create: { nombre: 'VENDEDOR' } }),
    prisma.rol.upsert({ where: { nombre: 'ALMACENISTA' }, update: {}, create: { nombre: 'ALMACENISTA' } }),
  ]);
  console.log(`✅ Roles: ${roles.map((r) => r.nombre).join(', ')}`);

  // ── Admin por defecto ────────────────────────────────────────────────────
  const adminRol = roles.find((r) => r.nombre === 'ADMIN')!;
  const passwordHash = await bcrypt.hash('Admin1234!', 12);

  const admin = await prisma.empleado.upsert({
    where: { email: 'admin@vault16.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@vault16.com',
      passwordHash,
      rolId: adminRol.id,
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ── Tallas ───────────────────────────────────────────────────────────────
  const tallasData = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const tallas = await Promise.all(
    tallasData.map((nombre, orden) =>
      prisma.talla.upsert({ where: { nombre }, update: {}, create: { nombre, orden } }),
    ),
  );
  console.log(`✅ Tallas: ${tallas.map((t) => t.nombre).join(', ')}`);

  // ── Categorías ───────────────────────────────────────────────────────────
  const catRopa = await prisma.categoria.upsert({
    where: { slug: 'ropa' },
    update: {},
    create: { nombre: 'Ropa', slug: 'ropa', descripcion: 'Ropa de moda urbana' },
  });
  await Promise.all([
    prisma.categoria.upsert({
      where: { slug: 'camisetas' },
      update: {},
      create: { nombre: 'Camisetas', slug: 'camisetas', parentId: catRopa.id },
    }),
    prisma.categoria.upsert({
      where: { slug: 'pantalones' },
      update: {},
      create: { nombre: 'Pantalones', slug: 'pantalones', parentId: catRopa.id },
    }),
    prisma.categoria.upsert({
      where: { slug: 'accesorios' },
      update: {},
      create: { nombre: 'Accesorios', slug: 'accesorios' },
    }),
  ]);
  console.log('✅ Categorías creadas');

  console.log('🎉 Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
