import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteService } from 'src/services/favorite/favorite.service';
import { FavoriteController } from 'src/controllers/favorite/favorite.controller';
import { Favorite } from 'src/entities/Favorite';
import { Evenement } from 'src/entities/Evenement';
import { User } from 'src/Authentication/entities/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Evenement, User])],
  providers: [FavoriteService],
  controllers: [FavoriteController],
})
export class FavoriteModule {}