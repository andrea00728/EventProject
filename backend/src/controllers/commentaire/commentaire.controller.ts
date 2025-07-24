import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CommentaireService } from 'src/services/commentaire/commentaire.service';
import { CreateCommentaireDto } from 'src/dto/create-commentaire.dto';
import { UpdateCommentaireDto } from 'src/dto/update-commentaire.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('commentaires')
@Controller('commentaire')
export class CommentaireController {
  constructor(private readonly commentaireService: CommentaireService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Créer un nouveau commentaire' })
  @ApiResponse({ status: 201, description: 'Commentaire créé avec succès.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  create(@Body() createCommentaireDto: CreateCommentaireDto, @Request() req) {
    return this.commentaireService.create(createCommentaireDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les commentaires' })
  @ApiResponse({ status: 200, description: 'Liste des commentaires.' })
  findAll() {
    return this.commentaireService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un commentaire par ID' })
  @ApiResponse({ status: 200, description: 'Commentaire trouvé.' })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.commentaireService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Mettre à jour un commentaire' })
  @ApiResponse({ status: 200, description: 'Commentaire mis à jour avec succès.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé.' })
  update(@Param('id') id: string, @Body() updateCommentaireDto: UpdateCommentaireDto, @Request() req) {
    return this.commentaireService.update(+id, updateCommentaireDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Supprimer un commentaire' })
  @ApiResponse({ status: 200, description: 'Commentaire supprimé avec succès.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 404, description: 'Commentaire non trouvé.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.commentaireService.remove(+id, req.user);
  }
}