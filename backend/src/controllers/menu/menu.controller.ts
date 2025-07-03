import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { MenuService } from '../../services/menu/menu.service';
import { Menu } from '../../entities/menu.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async createMenu(@Body() body: { name: string; eventId: number }): Promise<Menu> {
    return this.menuService.createMenu(body.name, body.eventId);
  }

  @Post(':id/items')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async addMenuItem(
    @Param('id', ParseIntPipe) menuId: number,
    @Body() body: { name: string; description: string; price: number; category: string; stock: number; stockThreshold?: number; eventId: number },
  ): Promise<MenuItem> {
    return this.menuService.addMenuItem(menuId, body);
  }

  @Patch(':menuId/items/:itemId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async updateMenuItem(
    @Param('menuId', ParseIntPipe) menuId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() body: { name?: string; description?: string; price?: number; category?: string; stock?: number; disabled?: boolean; stockThreshold?: number; eventId: number },
  ): Promise<MenuItem> {
    return this.menuService.updateMenuItem(menuId, itemId, body);
  }

  @Delete(':menuId/items/:itemId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async deleteMenuItem(@Param('menuId', ParseIntPipe) menuId: number, @Param('itemId', ParseIntPipe) itemId: number, @Body('eventId', ParseIntPipe) eventId: number): Promise<void> {
    return this.menuService.deleteMenuItem(menuId, itemId, eventId);
  }

  @Get('public')
  async getPublicMenu(@Query('eventId', ParseIntPipe) eventId: number): Promise<MenuItem[]> {
    return this.menuService.getPublicMenu(eventId);
  }
}