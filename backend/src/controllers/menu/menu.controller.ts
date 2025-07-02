import { Controller, Post, Get, Patch, Body, Param, UsePipes, ValidationPipe, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MenuService } from '../../services/menu/menu.service';
import { CreateMenuDto, CreateMenuItemDto, RestockMenuItemDto } from '../../dto/menu.dto';

@Controller('menus')
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async createMenu(@Body() body: CreateMenuDto, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');
    return this.menuService.createMenu(body.name, body.eventId);
  }

  @Post(':menuId/items')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async addMenuItem(@Param('menuId') menuId: number, @Body() body: CreateMenuItemDto, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');
    return this.menuService.addMenuItem(menuId, body);
  }

  @Get('event/:eventId')
  findMenuByEvent(@Param('eventId') eventId: number) {
    return this.menuService.findMenuByEvent(eventId);
  }

  @Get('items/:menuItemId')
  getMenuItem(@Param('menuItemId') menuItemId: number) {
    return this.menuService.getMenuItem(menuItemId);
  }

  @Patch('items/:menuItemId/restock')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async restockMenuItem(@Param('menuItemId') menuItemId: number, @Body() body: RestockMenuItemDto, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');
    return this.menuService.restockMenuItem(menuItemId, body.quantity);
  }
}