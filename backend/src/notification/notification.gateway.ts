// src/notification/notification.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  notifyOrderStatusUpdate(orderId: number, status: string) {
    this.server.emit('orderStatusUpdate', { orderId, status });
  }
}