import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateSatisfactionDto {
  @ApiProperty({ description: 'Indique si l\'utilisateur est satisfait', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isSatisfied?: boolean;
}