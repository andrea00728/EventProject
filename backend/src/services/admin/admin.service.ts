import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Admin } from 'src/entities/Admin';
import admin from 'src/firebase/firebase-admin';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Admin)
    private readonly userRepository: Repository<Admin>,
  ) {}

  async loginWithFirebase(idToken: string) {
    try {
      // Vérifier et décoder le token Firebase
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const email = decodedToken.email;
      const displayName = decodedToken.name || 'Admin';
      const photoURL = decodedToken.picture || null;

      // Chercher l'admin existant
      let adminUser = await this.userRepository.findOne({
        where: { email, role: 'admin' },
      });

      if (!adminUser) {
        if(email !== process.env.ADMIN_EMAIL_1 && email !== process.env.ADMIN_EMAIL_2) {
          throw new UnauthorizedException('Non autorisé : vous n\'êtes pas autorisé à vous connecter en tant qu\'admin');
        }

        adminUser = this.userRepository.create({
          id: uuidv4(),
          email,
          name: displayName,
          photo: photoURL ?? null,
          role: 'admin',
          isOnline: true,
          lastLogin: new Date(),
        } as Partial<Admin>);

        await this.userRepository.save(adminUser);
      }

      const payload = {
        sub: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          photo: adminUser.photo,
          role: adminUser.role,
        },
      };
    } catch (error) {
      console.error('Login with Firebase error:', error);
      throw new UnauthorizedException('Token Firebase invalide ou autre erreur');
    }
  }

  async updateProfile(idToken: string, updateData: { name?: string; bio?: string; photo?: string }) {
    try {
      // Vérifier le token Firebase
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const email = decodedToken.email;

      // Chercher l'admin correspondant
      const adminUser = await this.userRepository.findOne({ where: { email, role: 'admin' } });
      if (!adminUser) throw new UnauthorizedException('Admin non trouvé');

      // Mettre à jour uniquement les champs côté site
      adminUser.name = updateData.name ?? adminUser.name;
      adminUser.bio = updateData.bio ?? adminUser.bio;

      // Modifier la photo côté site seulement
      if (updateData.photo) {
        adminUser.photo = updateData.photo;  // Ne touche pas à photoEmail si tu as ce champ séparé
      }

      await this.userRepository.save(adminUser);

      return {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        photo: adminUser.photo,
        role: adminUser.role,
      };
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      throw new UnauthorizedException('Impossible de mettre à jour le profil');
    }
  }

}
