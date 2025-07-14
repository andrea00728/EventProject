    import { PassportStrategy } from '@nestjs/passport';
    import { Strategy, VerifyCallback } from 'passport-google-oauth20';
    import { Injectable } from '@nestjs/common';
    import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

    @Injectable()
    export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly authService: AuthService,private configServie:ConfigService) {
        const clientID = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

        if (!clientID || !clientSecret) {
        throw new Error('Google client ID and secret must be defined');
        }

        super({
        clientID,
        clientSecret,
        // callbackURL: 'http://localhost:3000/auth/google/callback',
        callbackURL: configServie.get<string>('GOOGLE_CALLBACK_URL'),
        scope: ['email', 'profile'],
        passReqToCallback: true,
        });
    }

    async validate(request: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const user = await this.authService.validateUser(profile);
        done(null, user);
    }
    }


    