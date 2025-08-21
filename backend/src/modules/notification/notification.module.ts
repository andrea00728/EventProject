import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from 'src/controllers/notification/notification.controller';
import { NotificationEntity } from 'src/entities/notification.entity';
import { NotificationGateway } from 'src/gateway/notification.gateway';
import { NotificationService } from 'src/services/notification/notification.service';

@Module({
    imports:[
    JwtModule.register({}),
    TypeOrmModule.forFeature([NotificationEntity])
    ],
    providers:[NotificationService,NotificationGateway],
    controllers:[NotificationController],
    exports:[NotificationService,NotificationGateway],
})


export class NotificationModule {}
