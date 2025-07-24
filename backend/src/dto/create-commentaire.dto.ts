import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCommentaireDto {
  @ApiProperty({ description: 'Contenu du commentaire', example: 'Ceci est un commentaire' })
  @IsString()
  @IsNotEmpty()
  contenu: string;
}