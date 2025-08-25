
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, ExtractJwt } from 'passport-jwt';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
//   constructor(private configService:ConfigService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//        secretOrKey: configService.get<string>('JWT_SECRET') || 'your_very_secure_jwt_secret_1234567890',
//     });
//   }

//   async validate(payload: any) {
//     console.log('Payload JWT:', payload); 
//     return { sub: payload.sub, email: payload.email, role: payload.role, name: payload.name || null, photo: payload.photo || null,};
//   }
// }


// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      // Utilisation d'un extracteur personnalisé pour récupérer le jeton
      // directement du cookie 'jwt' de la requête
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request.cookies['jwt'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your_very_secure_jwt_secret_1234567890',
    });
  }

  async validate(payload: any) {
    // Le payload est ce qui est retourné par l'endpoint protégé dans req.user
    return { 
      sub: payload.sub, 
      email: payload.email, 
      role: payload.role, 
      name: payload.name || null, 
      photo: payload.photo || null 
    };
  }
}