import { IsOptional } from "class-validator";
import { UserRole } from "../entities/auth.entity";

export class CreateUserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  expirationdate:Date;
  password : string ;
  @IsOptional()
  photo?: string
}
