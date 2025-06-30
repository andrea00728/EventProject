// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import { InjectRepository } from '@nestjs/typeorm';

// import { Repository } from 'typeorm';
// import { User } from 'src/entities/user.entity';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     configService: ConfigService,
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.get<string>('JWT_SECRET') || 'your_very_secure_jwt_secret_1234567890',
//     });
//   }

//   async validate(payload: any): Promise<User> {
//     const user = await this.userRepository.findOne({
//       where: { id: payload.sub },
//       relations: ['evenement'], // Charge les relations nécessaires
//     });

//     if (!user) {
//       throw new UnauthorizedException('Utilisateur non trouvé');
//     }

//     return user; // Cet objet sera disponible dans req.user
//   }
// }


import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService:ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
       secretOrKey: configService.get<string>('JWT_SECRET') || 'your_very_secure_jwt_secret_1234567890',
    });
  }

  async validate(payload: any) {
    console.log('Payload JWT:', payload); 
    return { sub: payload.sub, email: payload.email }; 
  }
}