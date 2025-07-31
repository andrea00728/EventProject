import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    console.log(`✅ Client connecté : ${client.id}`);
  }

  @SubscribeMessage('update_order_status')
  async handleStatusUpdate(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`🍽️ Mise à jour reçue :`, data);
    this.server.emit('order_status_updated', data); // Envoie à tous
  }

  // Nouvelle méthode pour gérer l'ajout d'une commande
  notifyNewOrder(order: any) {
    console.log(`📦 Nouvelle commande ajoutée :`, order);
    this.server.emit('new_order', order); // Émet l'événement à tous les clients
  }
}