/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import { Strategy, Profile } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    // 👇 Utilise une configuration compatible avec StrategyOptions (sans requête)
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const { id, displayName, emails, photos } = profile;
    const email = emails?.[0]?.value;
    if (!email) throw new Error('Aucun email retourné par Google');

    const user = {
      googleId: id,
      name: displayName ?? 'Unknown',
      email,
      role: 'organisateur' as const,
      photoUrl: photos?.[0]?.value ?? null,
      accessToken,
    };

    return this.authService.validateOrRegisterUser(user);
  }
}
