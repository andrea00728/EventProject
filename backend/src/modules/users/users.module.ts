/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersService } from '../../services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService], // Assurez-vous que UsersService est exporté
})
export class UsersModule {}