import { Injectable } from '@nestjs/common';
import { NotificationGateway } from 'src/gateway/notification.gateway'; 

@Injectable()
export class NotificationService {

    constructor(private getway:NotificationGateway) {}

    async notifyAll(title:string,message:string,type: 'info' | 'success' | 'error' | 'warning' = 'info'){
        this.getway.emitNotification({
            title,
            message,
            type,
            date: new Date().toISOString(),
        });
    }
}
