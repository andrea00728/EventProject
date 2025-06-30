import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { CreateTableDto } from 'src/dto/CreateTaleDto';
import { TableEvent } from 'src/entities/Table';
import { TableService } from 'src/services/table-service/table-service.service';

@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  // Créer une table
  @Post('create')
  async createTable(@Body() dto: CreateTableDto): Promise<TableEvent> {
    return await this.tableService.createTable(dto);
  }

  // Assigner un invité à une table
  @Post('assign/:guestId/:tableId')
  async assignGuestToTable(
    @Param('guestId', ParseIntPipe) guestId: number,
    @Param('tableId', ParseIntPipe) tableId: number,
    @Body('seatNumber') seatNumber: number,
  ): Promise<TableEvent> {
    if (!seatNumber || isNaN(seatNumber)) {
      throw new BadRequestException('seatNumber requis et doit être un nombre');
    }
    return await this.tableService.assignGuestToTable(guestId, tableId, seatNumber);
  }

  // Obtenir les places disponibles d'une table
  @Get(':tableId/available-seats')
  async getAvailableSeats(
    @Param('tableId', ParseIntPipe) tableId: number,
  ): Promise<number> {
    return await this.tableService.getAvailableSeats(tableId);
  }

  // Obtenir les tables liées à un événement
  @Get('event/:eventId')
  async getTablesByEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<TableEvent[]> {
    return await this.tableService.findByEvent(eventId);
  }
}