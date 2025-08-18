import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateCommentaireDto {
  @ApiProperty({ description: 'Nouveau contenu du commentaire', example: 'Contenu mis à jour' })
  @IsString()
  @IsNotEmpty()
  contenu: string;
}