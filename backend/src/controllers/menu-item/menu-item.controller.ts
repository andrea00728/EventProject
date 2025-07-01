import { Controller, Post, Get, Body, Param, Put, Delete } from '@nestjs/common';
import { MenuItemService } from 'src/services/menu-item/menu-item.service';
import { CreateMenuItemDto } from 'src/dto/create-menu-item.dto';
import { UpdateMenuItemDto } from 'src/dto/update-menu-item.dto';

@Controller('menu-items')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuItemService.create(dto);
  }

  @Get()
  findAll() {
    return this.menuItemService.findAll();
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: number) {
    return this.menuItemService.findByEvent(+eventId);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateMenuItemDto) {
    return this.menuItemService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.menuItemService.remove(id);
  }
}
