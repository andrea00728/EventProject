import { PartialType } from '@nestjs/mapped-types';
import {  CreateUserDto } from './create-auth.dto';

export class UpdateAuthDto {
  name?: string;
  email?: string;
  bio?: string;
  photo?: string;
}

