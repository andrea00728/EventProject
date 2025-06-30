// src/event/event.controller.ts
import { Controller, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { CreateEventDto } from 'src/dto/CreateEvenementDTO';
import { EvenementService } from 'src/services/evenement/evenement.service';

@Controller('evenements')
export class EvenementController {
  constructor(private readonly evenementService: EvenementService) {}

  @Post()
  async create(@Body() dto: CreateEventDto) {
    if (!dto.nom || !dto.type || !dto.theme || !dto.date || !dto.locationId || !dto.salleId) {
      throw new BadRequestException('Tous les champs sont requis');
    }
    return this.evenementService.create(dto);
  }

  @Get()
  findAll() {
    return this.evenementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evenementService.findOne(+id);
  }
}