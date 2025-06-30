
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