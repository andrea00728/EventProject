// fichier : src/modules/menu-item/menu-item.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from 'src/entities/menu-item.entity';
import { MenuItemController } from 'src/controllers/menu-item/menu-item.controller';
import { MenuItemService } from 'src/services/menu-item/menu-item.service';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem])], // 📌 injection du repository
  controllers: [MenuItemController],
  providers: [MenuItemService],
  exports: [MenuItemService], // export si besoin ailleurs
})
export class MenuItemModule {}
