import { Module } from '@nestjs/common';
import { NotificationGateway } from 'src/gateway/notification.gateway';
import { NotificationService } from 'src/services/notification/notification.service';

@Module({
    providers:[NotificationService,NotificationGateway],
    exports:[NotificationService,NotificationGateway],
})


export class NotificationModule {}
