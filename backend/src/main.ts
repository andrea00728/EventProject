// // Patch pour rendre crypto global (pour TypeORM et NestJS)


import  { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './Exception/http-exception.filter';
import * as express from 'express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  app.enableCors({
    origin:'https://mastertable.site' ,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  // Supprimer le middleware personnalisé pour OPTIONS, car Apache le gère
  // app.use((req, res, next) => {
  //   if (req.method === 'OPTIONS') {
  //     res.status(204).send();
  //   } else {
  //     next();
  //   }
  // });

  // Swagger API documentation
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
      'jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Servir les fichiers statiques
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Gestion globale des exceptions
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
