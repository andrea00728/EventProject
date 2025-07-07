import { Controller, Post, Get, Patch, Body, Param, UsePipes, ValidationPipe, ParseIntPipe, UseInterceptors, UploadedFile, Delete, UseGuards } from '@nestjs/common';
import { MenuService } from '../../services/menu/menu.service';
import { CreateMenuDto, CreateMenuItemDto } from 'src/dto/menu.dto';
import { IsInt, Min } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from 'src/guards/roles.decorator';


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

  @Roles('organisateur')
  @Post()
  @UsePipes(new ValidationPipe())
  createMenu(@Body() body: CreateMenuDto) {
    return this.menuService.createMenu(body.name, body.eventId);
  }

  @Roles('organisateur')
  @Post(':menuId/items')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads/menus',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `menuitem-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  addMenuItem(
    @Param('menuId', ParseIntPipe) menuId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateMenuItemDto
  ) {
    const photoPath = file ? `/uploads/menus/${file.filename}` : undefined;
    return this.menuService.addMenuItem(menuId, body, photoPath);
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

@Patch('items/:menuItemId')
  @UseInterceptors(FileInterceptor('photo', {
  storage: diskStorage({
    destination: './uploads/menus',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `menuitem-${uniqueSuffix}${ext}`);
    },
  }),
}))
updateMenuItem(
  @Param('menuItemId', ParseIntPipe) menuItemId: number,
  @UploadedFile() file: Express.Multer.File,
  @Body() body: Partial<CreateMenuItemDto>, // on autorise les champs partiels
) {
  const photoPath = file ? `/uploads/menus/${file.filename}` : undefined;
  return this.menuService.updateMenuItem(menuItemId, body, photoPath);
}

@Roles('organisateur')
@Delete('items/:menuItemId')
async deleteMenuItem(@Param('menuItemId', ParseIntPipe) menuItemId: number) {
  return this.menuService.deleteMenuItem(menuItemId);
}

}