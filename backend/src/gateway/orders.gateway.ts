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
    origin: process.env.CLIENT_URL || 'https://mastertable.site',
    credentials: true,
  },
   path: '/socket.io',
})
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  handleOrderRefunded(data: { id: number; paymentStatus: string }) {
    console.log(`Émission de l'événement orderRefunded: ${JSON.stringify(data)}`);
    this.server.emit('orderRefunded', data);
  }

  handleOrderDeleted(data: { id: number }) {
    console.log(`Émission de l'événement orderDeleted: ${JSON.stringify(data)}`);
    this.server.emit('orderDeleted', data);
  }

  @SubscribeMessage('update_order_status')
  async handleStatusUpdate(
    @MessageBody() data: any,
    @ConnectedSocket() client?: Socket, // Rendre client facultatif
  ) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🍽️ Mise à jour reçue :`, data);
    }
    this.server.emit('order_status_updated', data); // Émettre à tous les clients
  }

  // Nouvelle méthode pour gérer l'ajout d'une commande
  notifyNewOrder(order: any) {
    console.log(`📦 Nouvelle commande ajoutée :`, order);
    this.server.emit('new_order', order); // Émet l'événement à tous les clients
  }
  
}