import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Base de datos conectada');

    app.listen(env.PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido, cerrando...');
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
