import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Inclure le port de votre front-end (par exemple, Vite)
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client déconnecté: ${client.id}`);
  }

  @SubscribeMessage('changeStatus')
  handleChangeStatus(client: Socket, payload: { id: number; status: string }) {
    console.log('Événement changeStatus reçu:', payload);
    this.server.emit('updateOrderStatus', payload);
    return { status: 'success', data: payload };
  }
}