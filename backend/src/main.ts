// Patch pour rendre crypto global (pour TypeORM et NestJS)
globalThis.crypto = require('crypto');

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173', // URL de ton frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // si tu utilises des cookies ou l'authentification
  });
  
  await app.listen(process.env.PORT ?? 3000);

  
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
