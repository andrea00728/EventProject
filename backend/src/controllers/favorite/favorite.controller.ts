import { Controller, Post, Delete, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FavoriteService } from 'src/services/favorite/favorite.service';
import { CreateFavoriteDto } from 'src/dto/create-favorite.dto';
import { Favorite } from 'src/entities/Favorite';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(private readonly favoritesService: FavoriteService) {}

  @Post()
  async addFavorite(@Request() req, @Body() createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    return this.favoritesService.addFavorite(req.user.id, createFavoriteDto);
  }

  @Delete(':evenementId')
  async removeFavorite(@Request() req, @Param('evenementId') evenementId: number): Promise<void> {
    return this.favoritesService.removeFavorite(req.user.id, evenementId);
  }

  @Get()
  async getUserFavorites(@Request() req): Promise<Favorite[]> {
    return this.favoritesService.getUserFavorites(req.user.id);
  }
}