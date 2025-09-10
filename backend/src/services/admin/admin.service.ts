import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Admin } from 'src/entities/Admin';
import admin from 'src/firebase/firebase-admin';
import { Repository } from 'typeorm';
import {Request, Response } from 'express';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  // private readonly UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL || 'https://api.mastertable.site';
  private readonly UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL || 'https://api.mastertable.site';
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Admin)
    private readonly userRepository: Repository<Admin>,
    @InjectRedis()
    private readonly redis:Redis ,
  ) {}

async loginWithEmailAndPass(user: { email: string; password: string }, res: Response): Promise<any> {
  if (!user) return { message: "Email ou mot de passe oublié" };

  const adminUser = await this.userRepository.findOne({
    where: { email: user.email }
  });

  if (!adminUser) throw new UnauthorizedException('Admin non trouvé');

  // Vérifier que le mot de passe est défini
  if (!adminUser.password) {
    throw new UnauthorizedException('Mot de passe non défini pour cet utilisateur');
  }

  const isPasswordValid = await bcrypt.compare(user.password, adminUser.password);
  if (!isPasswordValid) throw new UnauthorizedException('Mot de passe incorrect');

  adminUser.lastLogin = new Date();
  adminUser.isOnline = true;
  await this.userRepository.save(adminUser);

  // Payload JWT
  const payload = { 
    sub: adminUser.id, 
    email: adminUser.email, 
    role: adminUser.role, 
    name: adminUser.name,
    photo:adminUser.photo && `${this.UPLOAD_BASE_URL}/uploads/${adminUser.photo}` || adminUser.photoEmail, 
  };

  // Générer les tokens
  const access_token = this.jwtService.sign(payload, { expiresIn: '1h' });
  const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

  // Placer les cookies HTTP-only
  res.cookie('jwt', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000, // 1 heure
  });

  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });

  return { 
    message: "Authentification réussie", 
    user: { id: adminUser.id, email: adminUser.email, role: adminUser.role, photo:adminUser.photo && `${this.UPLOAD_BASE_URL}/uploads/${adminUser.photo}` || adminUser.photoEmail, },
  };
}




  // async loginWithPasswordReceived () {
  // }

  async loginWithGoogleOAuth(user: any, res: Response) {
    try {
      const email = user.email;
      const displayName = user.displayName || 'Admin';
      const photoURL = user.photo || null;

      console.log("Photo dans Url", photoURL);

      // Chercher l'admin existant
      let adminUser = await this.userRepository.findOne({
        where: [{ email, role: 'admin' }, { email, role: 'super_admin' },]
      });

      if (!adminUser) {
        if (
           email !== process.env.ADMIN_EMAIL
          ) {
          throw new UnauthorizedException(
            "Non autorisé : vous n'êtes pas autorisé à vous connecter en tant qu'admin",
          );
        }

        adminUser = this.userRepository.create({
          id: uuidv4(),
          email,
          name: displayName,
          photoEmail: photoURL || null,
          role: 'super_admin',
          isOnline: true,
          lastLogin: new Date(),
        } as Partial<Admin>);

        await this.userRepository.save(adminUser);
      }

      adminUser.lastLogin = new Date();
      adminUser.isOnline = true;
      adminUser.photoEmail = photoURL;
      await this.userRepository.save(adminUser);

      // Générer les tokens JWT
      const payload = {
        sub: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
        photo: adminUser.photo && `${this.UPLOAD_BASE_URL}/uploads/${adminUser.photo}` || adminUser.photoEmail,
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
          photo: adminUser.photo && `${this.UPLOAD_BASE_URL}/uploads/${adminUser.photo}` || adminUser.photoEmail,
          role: adminUser.role,
        },
      };
    } catch (error) {
      console.error('Login with Google OAuth error:', error);
      throw new UnauthorizedException(
        error.message ||'Erreur lors de l’authentification Google OAuth',
      );
    }
  }

  async updatePassword(adminId: string, newPassword: string,): Promise<{ message: string }> {
    const admin = await this.userRepository.findOne({ where: { id: adminId } });

    if (!admin) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mise à jour
    admin.password = hashedPassword;
    await this.userRepository.save(admin);

    return { message: 'Mot de passe mis à jour avec succès' };
  }
  
  async createUser(user: { name: string; email: string }): Promise<Admin> {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await this.userRepository.findOne({ where: { email: user.email } });
      if (existingUser) {
        throw new BadRequestException('Un administrateur avec cet email existe déjà.');
      }

      // Création de l'utilisateur
      const adminUser = this.userRepository.create({
        id: uuidv4(),
        email: user.email,
        name: user.name,
        role: 'admin',
        isOnline: false,
        lastLogin: new Date(),
      } as Partial<Admin>);

      const res = await this.userRepository.save(adminUser);
      return res;

    } catch (error) {
      if (error instanceof BadRequestException) {
        // On renvoie l'erreur déjà gérée (email existant)
        throw error;
      }
      console.error('Erreur lors de la création de l’administrateur :', error);
      // Pour toute autre erreur inconnue
      throw new InternalServerErrorException('Impossible de créer l’administrateur pour le moment.');
    }
  }


  async logout(req: Request, res: Response): Promise<{ success: boolean; message: string }> {
    try {
      const jwtCookie = req.cookies['jwt'];
      const refreshToken = req.cookies['refresh_token'];

      console.log("🔑 Cookie JWT reçu :", jwtCookie);
      console.log("🔑 Refresh token reçu :", refreshToken);

      if (!jwtCookie) {
        return { success: false, message: 'Aucun jeton fourni' };
      }

      let decoded: any;
      try {
        decoded = await this.jwtService.verifyAsync(jwtCookie, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });
      } catch (err) {
        console.error("❌ Token invalide :", err.message);
        return { success: false, message: 'Token invalide' };
      }

      if (decoded?.sub) {
        await this.userRepository.update(
          { id: decoded.sub },
          { lastLogout: new Date(), isOnline: false }
        );
      }

      try {
        await this.jwtService.verifyAsync(jwtCookie, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });
      } catch (err) {
        console.error("❌ Token invalide :", err.message);
        return { success: false, message: 'Token invalide' };
      }

      // Blacklist du JWT
      try {
        await this.redis.set(`blacklist:${jwtCookie}`, 'true', 'EX', 24 * 60 * 60);
        if (refreshToken) {
          await this.redis.set(`blacklist_refresh:${refreshToken}`, 'true', 'EX', 7 * 24 * 60 * 60); // ex : 7j
        }
      } catch (err) {
        console.error("⚠️ Erreur Redis :", err.message);
        return { success: false, message: 'Erreur lors de la déconnexion (Redis)' };
      }

      // Suppression sécurisée des cookies
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return { success: true, message: 'Déconnexion réussie' };
    } catch (error: any) {
      console.error("⚠️ Erreur générale lors du logout :", error.message);
      return { success: false, message: 'Erreur interne lors de la déconnexion' };
    }
  }

  async hasPassword(adminId: string): Promise<{ hasPassword: boolean }> {
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
      select: ['id', 'password'], // on récupère uniquement l'id et le password
    });

    if (!admin) {
      throw new NotFoundException('Admin introuvable');
    }

    return { hasPassword: !!admin.password }; // true si password existe, false sinon
  }


  async getAllAdmins(): Promise<Admin[]> {
    const admins = await this.userRepository.find({
      where: { role: 'admin' },
      select: ['id', 'name', 'email', 'photo', 'role', 'isOnline', 'lastLogin', 'lastLogout', 'createdAt', 'photoEmail'],
      order: { lastLogin: 'DESC' }, // optionnel : les admins les plus récents d’abord
    });
    return admins;
  }

  async updateAdmin(adminId: string, data: any, photoFilename?: string,): Promise<{ user: any }> {
    const admin = await this.userRepository.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Administrateur non trouvé');

    // Si password fourni, le hash
    if (data.password && data.password.trim() !== '') {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password; // empêche l'overwrite avec vide
    }

    // Vérifier email
    if (data.email && data.email.trim() !== '') {
      admin.email = data.email;
    } else {
      delete data.email;
    }

    // Vérifier name
    if (data.name && data.name.trim() !== '') {
      admin.name = data.name;
    } else {
      delete data.name;
    }

    // Gestion photo
    if (photoFilename) {
      if (admin.photo) {
        const oldPath = path.join(process.cwd(), 'uploads', admin.photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      admin.photo = photoFilename;
    }

    // Fusionne uniquement les champs valides restants
    Object.assign(admin, data);

    await this.userRepository.save(admin);

    return {
      user: {
        sub: admin.id,
        email: admin.email,
        name: admin.name,
        photo: admin.photo && `${this.UPLOAD_BASE_URL}/uploads/${admin.photo}` || admin.photoEmail,
        role: admin.role,
      },
    };
  }





  async deleteAdmin(adminId: string): Promise<{ message: string }> {
    const admin = await this.userRepository.findOne({ where: { id: adminId } });

    if (!admin) {
      throw new NotFoundException('Administrateur non trouvé');
    }

    // Vérifier si l’admin a une photo
    if (admin.photo) {
      const photoPath = path.join(__dirname, '../../../uploads', admin.photo);

      try {
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath); // suppression synchrone
        }
      } catch (error) {
        throw new InternalServerErrorException(
          `Erreur lors de la suppression de la photo : ${error.message}`,
        );
      }
    }

    await this.userRepository.remove(admin);

    return { message: 'Administrateur et sa photo supprimés avec succès' };
  }

}