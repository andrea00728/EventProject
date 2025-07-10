import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateSystemPromptDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateSystemPromptDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}