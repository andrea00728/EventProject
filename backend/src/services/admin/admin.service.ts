import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Admin } from 'src/entities/Admin';
import admin from 'src/firebase/firebase-admin';
import { Repository } from 'typeorm';
import { Response } from 'express';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';

@Injectable()
export class AdminService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Admin)
    private readonly userRepository: Repository<Admin>,
    @InjectRedis()
    private readonly redis:Redis ,
  ) {}

  async loginWithGoogleOAuth(user: any, res: Response) {
    try {
      const email = user.email;
      const displayName = user.displayName || 'Admin';
      const photoURL = user.photos?.[0]?.value || null;

      // Chercher l'admin existant
      let adminUser = await this.userRepository.findOne({
        where: [{ email, role: 'admin' }, 
          { email, role: 'super_admin' }, ],
      });

      if (!adminUser) {
        if (email !== process.env.ADMIN_EMAIL_1 && email !== process.env.ADMIN_EMAIL_2) {
          throw new UnauthorizedException(
            "Non autorisé : vous n'êtes pas autorisé à vous connecter en tant qu'admin",
          );
        }

        adminUser = this.userRepository.create({
          id: uuidv4(),
          email,
          name: displayName,
          photo: photoURL,
          role: 'super_admin',
          isOnline: true,
          lastLogin: new Date(),
        } as Partial<Admin>);

        await this.userRepository.save(adminUser);
      }

      // Générer les tokens JWT
      const payload = {
        sub: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
        photo: adminUser.photo,
      };

      const access_token = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

      // Placer les cookies HTTP-only
      res.cookie('jwt', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
      });

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          photo: adminUser.photo,
          role: adminUser.role,
        },
      };
    } catch (error) {
      console.error('Login with Google OAuth error:', error);
      throw new UnauthorizedException(
        'Erreur lors de l’authentification Google OAuth',
      );
    }
  }
  
  async createUser(user : {name : string; email: string; photo ?: string}):Promise<{ message: string }>{
    const adminUser = this.userRepository.create({
          id: uuidv4(),
          email:user.email,
          name: user.name,
          photo: user.photo,
          role: 'admin',
          isOnline: true,
          lastLogin: new Date(),
        } as Partial<Admin>);
    await this.userRepository.save(adminUser);

    return { message: 'Administrateur créé' };
  }


  async logout(req: Request, res: Response): Promise<{ message: string }> {
    try {
      const jwtCookie = (req as any).cookies['jwt'];
      if (!jwtCookie) {
        throw new Error('Aucun jeton fourni');
      }

      await this.jwtService.verifyAsync(jwtCookie, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });

      await this.redis.set(`blacklist:${jwtCookie}`, 'true', 'EX', 24 * 60 * 60);

      res.clearCookie('jwt');
      res.clearCookie('refresh_token');

      return { message: 'Déconnexion réussie' };
    } catch (error) {
      throw new Error('Token invalide ou erreur lors de la déconnexion');
    }
  }
}

