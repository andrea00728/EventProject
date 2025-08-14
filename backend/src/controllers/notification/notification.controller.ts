import { BadRequestException, Controller, Delete, Get, NotFoundException, Param } from '@nestjs/common';
import { NotificationEntity } from 'src/entities/notification.entity';
import { NotificationService } from 'src/services/notification/notification.service';

@Controller('notification')
export class NotificationController {
    constructor(
        private readonly notificationService:NotificationService
    ){}

   @Get('/all')
/**
 * Retrieves all notifications from the notification service.
 * 
 * @returns A promise that resolves to an array of NotificationEntity objects.
 * @throws Will throw an error if there is an issue retrieving the notifications.
 */

  async findAllNotifications(): Promise<NotificationEntity[]> {
    try {
      const notifications = await this.notificationService.findAll();
      return notifications;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications :', error);
      throw error;
    }
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) throw new BadRequestException('ID invalide');

    const result = await this.notificationService.delete(idNumber);
    if (result.affected === 0) throw new NotFoundException(`Notification ${idNumber} introuvable`);

    return { message: `Notification ${idNumber} supprimée` };
  }
  
}
