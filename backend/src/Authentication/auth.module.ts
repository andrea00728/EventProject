
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './google.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { User } from './entities/auth.entity';
import { Personnel } from 'src/entities/Personnel';
import { Forfait } from 'src/entities/Forfait';


@Module({
  imports: [
    TypeOrmModule.forFeature([User,Personnel,Forfait]),
    PassportModule,
    JwtModule.register({
      secret: 'andreanadjasylvanoilaina',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy,JwtStrategy],
})
export class AuthModule {}