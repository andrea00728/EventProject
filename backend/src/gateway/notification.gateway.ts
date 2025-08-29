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
    //Notification Message pour l'admin
    emitNotificationMessage(payload : any){
        console.log('Envoi notification message:', payload);
        this.server.emit('notificationMessageAdmin', payload);
    }

    //Notification pour un nouveau evenement
    emitNotifEventForAdmin(newEvent : any){
        console.log('Envoi notif pour nouveau event a l admin :', newEvent);
        this.server.emit('notifNewEventForAdmin', newEvent);
    }
}