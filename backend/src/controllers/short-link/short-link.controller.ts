// src/controllers/short-link/short-link.controller.ts
import { Controller, Get, Param, Redirect, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortLink } from 'src/entities/ShortLink';

@Controller('qr')
export class ShortLinkController {
  constructor(
    @InjectRepository(ShortLink)
    private readonly shortLinkRepository: Repository<ShortLink>,
  ) {}

  @Get(':slug')
  @Redirect()
  async redirectToOriginalUrl(@Param('slug') slug: string) {
    const shortLink = await this.shortLinkRepository.findOne({ where: { slug } });
    if (!shortLink) {
      throw new NotFoundException('Lien court non trouvé');
    }
    return { url: shortLink.originalUrl };
  }
}