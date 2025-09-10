import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
  ParseIntPipe,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateElementDto } from 'src/dto/CreateElementDto';
import { EvenementService } from 'src/services/evenement/evenement.service';
import { Element } from 'src/entities/Element';
import { ElementService } from 'src/services/element.service';

@Controller('elements')
export class ElementController {
  constructor(
    private readonly elementService: ElementService,
    private readonly evenementService: EvenementService,
  ) {}

  @Post('/create/by_event')
  @UseGuards(AuthGuard('jwt'))
  async createElement(@Body() dto: CreateElementDto, @Req() req): Promise<Element[]> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const event = await this.evenementService.findOneById(dto.eventId);
    if (!event) {
      throw new NotFoundException("Événement non trouvé");
    }
    if (event.user.id !== userId) {
      throw new UnauthorizedException("Cet événement n'appartient pas à l'utilisateur connecté");
    }

    return this.elementService.createElement(dto, userId);
  }

  @Get('event/:eventId')
  @UseGuards(AuthGuard('jwt'))
  async getElementsByEvent(@Param('eventId', ParseIntPipe) eventId: number, @Req() req): Promise<Element[]> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.elementService.findByEvent(eventId);
  }

  @Patch(':elementId/position')
  @UseGuards(AuthGuard('jwt'))
  async updateElementPosition(
    @Param('elementId', ParseIntPipe) elementId: number,
    @Body() position: { left: number; top: number },
    @Req() req,
  ): Promise<Element> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.elementService.updateElementPosition(elementId, position);
  }

  @Patch(':elementId/rotation')
  @UseGuards(AuthGuard('jwt'))
  async updateElementRotation(
    @Param('elementId', ParseIntPipe) elementId: number,
    @Body('rotation') rotation: number,
    @Req() req,
  ): Promise<Element> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.elementService.updateElementRotation(elementId, rotation);
  }

  @Patch(':elementId')
@UseGuards(AuthGuard('jwt'))
async updateElement(
  @Param('elementId', ParseIntPipe) elementId: number,
  @Body() updateData: Partial<Element>,
  @Req() req,
): Promise<Element> {
  const userId = req.user?.sub;
  if (!userId) {
    throw new UnauthorizedException('Utilisateur non authentifié');
  }

  // Vérifier que l'élément existe et appartient à l'utilisateur
  const element = await this.elementService.findOneById(elementId);
  if (!element) {
    throw new NotFoundException(`Élément avec ID ${elementId} non trouvé`);
  }
  if (element.event.user.id !== userId) {
    throw new UnauthorizedException("Cet élément n'appartient pas à l'utilisateur connecté");
  }

  // Si un eventId est fourni dans updateData, vérifier qu'il est valide
  if (updateData.event?.id) {
    const event = await this.evenementService.findOneById(updateData.event.id);
    if (!event) {
      throw new NotFoundException("Événement non trouvé");
    }
    if (event.user.id !== userId) {
      throw new UnauthorizedException("L'événement fourni n'appartient pas à l'utilisateur connecté");
    }
  }

  return this.elementService.updateElement(elementId, updateData);
}

  @Delete(':elementId')
  @Delete(':elementId')
@UseGuards(AuthGuard('jwt'))
async deleteElement(@Param('elementId', ParseIntPipe) elementId: number, @Req() req): Promise<void> {
  const userId = req.user?.sub;
  if (!userId) {
    throw new UnauthorizedException('Utilisateur non authentifié');
  }
  return this.elementService.deleteElement(elementId, userId); // Passer userId
}
}