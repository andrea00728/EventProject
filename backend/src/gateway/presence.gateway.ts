import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/Authentication/auth.service';

@WebSocketGateway({
  cors: {
  origin: 'https://mastertable.site',
  credentials: true,
   path: '/socket.io',
},
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly usersService: AuthService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    console.log('[Gateway] Connexion WebSocket userId =', userId);

    // if (!userId) {
    //   client.disconnect();
    //   return;
    // }

    await this.usersService.updateStatus(userId, true);

    console.log(`[Gateway] Emit organizer_connected pour ${userId}`);
    this.server.emit('organizer_connected', { userId });
  }


  async handleDisconnect(client: Socket) {
    const userId = client.handshake.auth?.userId;
    // if (!userId) return;

    await this.usersService.updateStatus(userId, false);
    this.server.emit('organizer_disconnected', { userId });
  }
  
}
