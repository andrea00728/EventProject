import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

// Define the enum for status
enum PersonnelStatus {
  ATTENT = 'attent',
  ACCEPTER = 'accepter',
}

export class UpdatePersonnelDto {
  @IsString()
  @IsOptional()
  nom?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsEnum(PersonnelStatus)
  @IsOptional()
  status?: PersonnelStatus;
}