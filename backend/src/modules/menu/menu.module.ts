import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from '../../entities/menu.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { MenuService } from '../../services/menu/menu.service';
import { MenuController } from '../../controllers/menu/menu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, MenuItem])],
  providers: [MenuService],
  controllers: [MenuController],
})
export class MenuModule {}