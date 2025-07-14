// src/services/qrcode/qr-code.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortLink } from 'src/entities/ShortLink';
import { nanoid } from 'nanoid';

@Injectable()
export class QrCodeService {
   constructor(
    @InjectRepository(ShortLink)
    private readonly shortLinkRepository: Repository<ShortLink>,
  ) {}
  async generateQrCode(url: string): Promise<string> {
    return QRCode.toDataURL(url); // Renvoie l'image encodée en base64
  }

  async generateQrCodeForTable(eventId: number, tableId: number): Promise<string> {
    // Vérifier si un lien court existe déjà pour cette table et cet événement
    let shortLink = await this.shortLinkRepository.findOne({
      where: { eventId, tableId },
    });

    if (!shortLink) {


      const { nanoid } = await import('nanoid');
      const slug = nanoid(8);// Slug de 8 caractères
      const originalUrl = `http://localhost:3000/menus/event/${eventId}/table/${tableId}`;

      // Créer et enregistrer le lien court
      shortLink = this.shortLinkRepository.create({
        slug,
        eventId,
        tableId,
        originalUrl,
      });
      await this.shortLinkRepository.save(shortLink);
    }

    // Générer l'URL courte
    const shortUrl = `http://localhost:3000/qr/${shortLink.slug}`;

    // Générer le QR code pour l'URL courte
    return QRCode.toDataURL(shortUrl); // Renvoie l'image encodée en base64
  }
}