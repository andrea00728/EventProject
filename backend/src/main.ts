import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './Exception/http-exception.filter';
import * as express from 'express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { TasksService } from './services/tasks/tasks.service';
import cookieParser from 'cookie-parser';
import { ForfaitService } from './services/forfait/forfait.service';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ForfaitExpirationInterceptor implements NestInterceptor {
  constructor(private forfaitService: ForfaitService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.sub;
    if (userId) {
      await this.forfaitService.checkForfaitExpiration(userId);
    }
    return next.handle();
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS HTTP + WebSocket
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
  });

  // Adapter WebSocket avec transports forcés
  class CustomIoAdapter extends IoAdapter {
    createIOServer(port: number, options?: any) {
      const server = super.createIOServer(port, {
        ...options,
        cors: {
          origin: 'http://localhost:5173',
          methods: ['GET', 'POST'],
          credentials: true,
        },
        transports: ['websocket', 'polling'],
      });
      return server;
    }
  }
  app.useWebSocketAdapter(new CustomIoAdapter(app));

  app.use(cookieParser());

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
      'jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Servir les fichiers statiques
  app.use('/uploads', express.static(join(__dirname, '..', 'Uploads')));

  // Gestion globale des exceptions
  app.useGlobalFilters(new HttpExceptionFilter());

  // Intercepteur global pour vérifier l'expiration des forfaits
  app.useGlobalInterceptors(new ForfaitExpirationInterceptor(app.get(ForfaitService)));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();