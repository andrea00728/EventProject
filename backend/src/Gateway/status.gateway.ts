import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { UserService } from './user.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(/*private userService: UserService*/) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    console.log("Status du l'utilisateur : ", userId);

    if (userId) {
    //   await this.userService.setOnlineStatus(userId, true);
      this.server.emit('organizer_connected', { userId });
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    console.log("Status du l'utilisateur : ", userId);
    if (userId) {
    //   await this.userService.setOnlineStatus(userId, false);
      this.server.emit('organizer_disconnected', { userId });
    }
  }
}
