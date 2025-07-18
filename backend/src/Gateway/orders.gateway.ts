// src/orders/orders.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // autoriser tous les domaines (ajuste selon besoin)
  },
})
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  // Pour écouter un changement de statut
  @SubscribeMessage('changeStatus')
  handleChangeStatus(client: Socket, payload: any) {
    console.log('Changement reçu:', payload);
    // Diffusion à tous les clients
    this.server.emit('updateOrderStatus', payload);
  }

  // Si tu veux un message de bienvenue
  handleConnection(client: Socket) {
    console.log(`Client connecté: ${client.id}`);
  }
}
