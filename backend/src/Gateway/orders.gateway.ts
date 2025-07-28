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

  handleConnection(client: Socket) {
    console.log(`✅ Client connecté : ${client.id}`);
  }

  @SubscribeMessage('update_order_status')
  handleStatusUpdate(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`🍽️ Mise à jour reçue :`, data);
    this.server.emit('order_status_updated', data); // Envoie à tous
  }
}
