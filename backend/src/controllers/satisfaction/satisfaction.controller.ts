import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { SatisfactionService } from 'src/services/satisfaction/satisfaction.service';
import { CreateSatisfactionDto } from 'src/dto/create-satisfaction.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('satisfactions')
@Controller('satisfaction')
export class SatisfactionController {
  constructor(private readonly satisfactionService: SatisfactionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Créer une nouvelle satisfaction' })
  @ApiResponse({ status: 201, description: 'Satisfaction créée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  create(@Body() createSatisfactionDto: CreateSatisfactionDto, @Request() req) {
    return this.satisfactionService.create(createSatisfactionDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les satisfactions' })
  @ApiResponse({ status: 200, description: 'Liste des satisfactions.' })
  findAll() {
    return this.satisfactionService.findAll();
  }
}