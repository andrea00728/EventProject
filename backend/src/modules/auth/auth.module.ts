/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from '../../strategies/google.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { AuthController } from '../../controllers/auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module'; // Importez UsersModule

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule, // Ajoutez cette ligne pour accéder à UsersService
  ],
  providers: [AuthService, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}