import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/Admin'
import { AdminService } from 'src/services/admin/admin.service';
import { AdminController } from 'src/controllers/admin/admin.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategies/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), JwtModule.register({
        secret: 'andreanadjasylvanoilaina',
        signOptions: { expiresIn: '60m' },
      }),],
  providers: [AdminService, JwtStrategy],
  controllers: [AdminController],
})
export class AdminModule {}
