import { UserRole } from "../entities/auth.entity";

export class CreateUserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  expirationdate:Date;
}
