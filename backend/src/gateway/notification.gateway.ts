import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({cors: true})
export class NotificationGateway{

    @WebSocketServer()
    server:Server;

    emitNotification(notification:{title:string;message:string;type?:string;date?:string}){
        console.log('Envoi notification:', notification);
        this.server.emit('notification',notification);
    }


    emitNotifRegisterToAdmin(notifRegister:{title:string;message:string;type?:string;date?:string}){
        console.log('Envoi notifRegister:', notifRegister);
        this.server.emit('notifRegister',notifRegister);
    }
}