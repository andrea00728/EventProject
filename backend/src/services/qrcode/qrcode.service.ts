import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortLink } from 'src/entities/ShortLink';
import { nanoid } from 'nanoid/non-secure'; // ✅ version compatible CommonJS

@Injectable()
export class QrCodeService {
  constructor(
    @InjectRepository(ShortLink)
    private readonly shortLinkRepository: Repository<ShortLink>,
  ) {}

  async generateQrCode(url: string): Promise<string> {
    return QRCode.toDataURL(url);
  }

  async generateQrCodeForTable(eventId: number, tableId: number): Promise<string> {
    let shortLink = await this.shortLinkRepository.findOne({
      where: { eventId, tableId },
    });

    if (!shortLink) {


      // const { nanoid } = await import('nanoid');
      const { nanoid } = require('nanoid');
      const slug = nanoid(8);// Slug de 8 caractères
      const originalUrl = `https://api.mastertable.site/menus/event/${eventId}/table/${tableId}`;

      shortLink = this.shortLinkRepository.create({
        slug,
        eventId,
        tableId,
        originalUrl,
      });

      await this.shortLinkRepository.save(shortLink);
    }

    const shortUrl = `https://mastertable.site/menulist/${shortLink.slug}`;
    return QRCode.toDataURL(shortUrl);
  }
}
