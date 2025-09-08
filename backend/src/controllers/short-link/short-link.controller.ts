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

  // ✅ 1. Mettre cette route en premier pour éviter que /:slug la capture
  @Get(':slug/info')
  async getShortLinkInfo(@Param('slug') slug: string) {
    const shortLink = await this.shortLinkRepository.findOne({ where: { slug } });

    if (!shortLink) {
      throw new NotFoundException('Lien court non trouvé');
    }

    return {
      eventId: shortLink.eventId,
      tableId: shortLink.tableId,
      originalUrl: shortLink.originalUrl,
    };
  }

  // ✅ 2. Redirection vers l'URL originale
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
