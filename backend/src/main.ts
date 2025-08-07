// Patch pour rendre crypto global (pour TypeORM et NestJS)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './Exception/http-exception.filter';
import * as express from 'express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('Commentaire API')
    .setDescription('API pour gérer les commentaires avec authentification JWT')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt', // Nom de la clé d'authentification
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Expose Swagger à l'URL /api

  app.enableCors({
    origin:  'https://mastertable.site',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // si tu utilises des cookies ou l'authentification
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.useGlobalFilters(new HttpExceptionFilter())
  await app.listen(process.env.PORT ?? 3000);

  
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
