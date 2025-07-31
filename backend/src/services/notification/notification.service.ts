import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from 'src/entities/notification.entity';
import { NotificationGateway } from 'src/gateway/notification.gateway'; 
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
    

    constructor(
        @InjectRepository(NotificationEntity)
        private notificationRepository:Repository<NotificationEntity>,
        private getway:NotificationGateway
    ) {}

    async notifyAll(title:string,message:string,type: 'info' | 'success' | 'error' | 'warning' = 'info'){
        this.getway.emitNotification({
            title,
            message,
            type,
            date: new Date().toISOString(),
        });
    }


    async notifyAll__(title:string,message:string,type: 'info' | 'success' | 'error' | 'warning' = 'info'){
        const notif= this.notificationRepository.create({
            title,
            message,
            type,

        });
        const savedNotif= await this.notificationRepository.save(notif);
        this.getway.emitNotification({
            title:savedNotif.title,
            message:savedNotif.message,
            type:savedNotif.type,
            date:savedNotif.date.toISOString(),
        });
    }


   async findAll(): Promise<NotificationEntity[]> {
        const response=this.notificationRepository.find({
            order:{date:'DESC'},
        });

        return response;
    }

}
