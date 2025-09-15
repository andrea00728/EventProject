
import { NotificationEntity } from 'src/entities/notification.entity';
import { NotificationService } from 'src/services/notification/notification.service';

import { Controller, Get, Delete, Param, Patch, Body } from '@nestjs/common';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/all')
  async findAllNotifications(): Promise<NotificationEntity[]> {
    return this.notificationService.findAll();
  }

  @Delete('/:id')
  async deleteNotification(@Param('id') id: number): Promise<{ message: string }> {
    await this.notificationService.delete(id);
    return { message: 'Notification supprimée avec succès' };
  }

  @Patch('/:id')
  async updateReadStatus(
    @Param('id') id: number,
    @Body('isRead') isRead: boolean,
  ): Promise<NotificationEntity> {
    return this.notificationService.updateReadStatus(id, isRead);
  }
}

