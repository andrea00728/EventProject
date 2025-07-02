import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableEvent } from '../../entities/Table';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  constructor(
    @InjectRepository(TableEvent)
    private tableEventRepository: Repository<TableEvent>,
  ) {}

  async generateQrCodeForTable(tableId: number): Promise<string> {
    const table = await this.tableEventRepository.findOne({ where: { id: tableId } });
    if (!table) throw new NotFoundException('Table not found');

    const url = `http://localhost:3000/orders/table/${tableId}`;
    return QRCode.toDataURL(url);
  }
}