import { Controller, Post, Get, Patch, Body, Param, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { MenuService } from '../../services/menu/menu.service';
import { CreateMenuDto, CreateMenuItemDto } from 'src/dto/menu.dto';
import { IsInt, Min } from 'class-validator';

export class RestockMenuItemDto {
  @IsInt()
  @Min(1)
  quantity: number;
}

@Controller('menus')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get()
  findAllMenus() {
    return this.menuService.findAllMenus();
  }

  @Post()
  @UsePipes(new ValidationPipe())
  createMenu(@Body() body: CreateMenuDto) {
    return this.menuService.createMenu(body.name, body.eventId);
  }

  @Post(':menuId/items')
  @UsePipes(new ValidationPipe())
  addMenuItem(@Param('menuId', ParseIntPipe) menuId: number, @Body() body: CreateMenuItemDto) {
    return this.menuService.addMenuItem(menuId, body);
  }

  @Get('event/:eventId')
  findMenuByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.menuService.findMenuByEvent(eventId);
  }

  @Get('items/:menuItemId')
  getMenuItem(@Param('menuItemId', ParseIntPipe) menuItemId: number) {
    return this.menuService.getMenuItem(menuItemId);
  }

  @Patch('items/:menuItemId/restock')
  @UsePipes(new ValidationPipe())
  restockMenuItem(@Param('menuItemId', ParseIntPipe) menuItemId: number, @Body() body: RestockMenuItemDto) {
    return this.menuService.restockMenuItem(menuItemId, body.quantity);
  }
}