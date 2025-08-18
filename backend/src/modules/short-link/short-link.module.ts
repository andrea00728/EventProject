import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortLinkController } from 'src/controllers/short-link/short-link.controller';
import { ShortLink } from 'src/entities/ShortLink';

@Module({
  imports: [TypeOrmModule.forFeature([ShortLink])],
  controllers: [ShortLinkController],
})
export class ShortLinkModule {}
