import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { User } from './entities/auth.entity';
import { CreateUserDto } from './dto/create-auth.dto';
import { Personnel } from 'src/entities/Personnel';
import { Evenement } from 'src/entities/Evenement';
import { Forfait } from 'src/entities/Forfait';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly tokenBlacklist = new Set<string>();
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService:ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
    @InjectRepository(Evenement)
    private readonly eventRepository: Repository<Evenement>,
    @InjectRepository(Forfait)
    private readonly forfaitRepository: Repository<Forfait>,
  ) { }

  async validateUser(profile: any): Promise<any> {
    const { emails, displayName, photos } = profile;
    const email = emails[0].value;
    console.log('Google Profile Data:', { email, displayName, photos });

    // Vérifier si l'utilisateur est dans la table Personnel
    const personnel = await this.personnelRepository.findOne({
      where: { email },
      relations: ['evenement'],
    });

    const isInPersonnel = !!personnel;
    const isdetectedRole = isInPersonnel ? personnel.role : 'organisateur';
    console.log('Rôle détecté:', { isInPersonnel, isdetectedRole });

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      const freemium = await this.forfaitRepository.findOne({ where: { id: 11 } });

      if (!freemium) {
        throw new Error('Forfait freemium non trouvé');
      }

      user = this.userRepository.create({
        id: uuidv4(),
        email,
        name: displayName || null,
        photo: photos?.[0]?.value || null,
        role: isdetectedRole,
        forfait: { id: 11 } as Forfait,
      });

      await this.userRepository.save(user);
      console.log('Nouvel utilisateur créé:', { id: user.id, email, role: user.role });
    } else {
      // Mettre à jour name, photo et role
      user.name = displayName || null;
      user.photo = photos?.[0]?.value || null;
      user.role = isdetectedRole; // Synchroniser le rôle
      await this.userRepository.save(user);
      console.log('Utilisateur mis à jour:', { id: user.id, email, role: user.role });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photo: user.photo,
      role: isdetectedRole,
      isInPersonnel,
    };
  }

  // async login(user: any) {
  //   const payload = {
  //     email: user.email,
  //     sub: user.id,
  //     role: user.role,
  //     name: user.name,
  //     photo: user.photo,
  //   };
  //   console.log('JWT Payload:', payload);
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      name: user.name,
      photo: user.photo,
    };
    console.log('JWT Payload:', payload);
    
    // Appeler la méthode qui génère les deux jetons
    return this.generateTokens(payload);
  }

  /**
   * Génère un couple de jetons d'accès et de rafraîchissement
   * @param payload Données à inclure dans le jeton
   * @returns Un objet contenant les deux jetons
   */
async generateTokens(payload: any) {
    // Access token court (ex : 6 min)
    const access_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '1m',
    });

    // Refresh token long (ex : 7 jours)
    const refresh_token = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || '3f1d2e4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
        expiresIn: '2m',
      }
    );

    return { access_token, refresh_token };
  }

 

  /**
   * Génère un nouveau couple de jetons d'accès et de rafraîchissement
   * en échange d'un jeton de rafraîchissement valide
   * @param refreshToken Jeton de rafraîchissement
   * @returns Un objet contenant les deux nouveaux jetons
   * @throws UnauthorizedException si le jeton est invalide ou a expiré
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      return this.generateTokens({ sub: payload.sub, email: payload.email });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Déconnecte un utilisateur en supprimant son jeton d'accès
   * @param token Jeton d'accès à supprimer
   * @param res Objet de réponse HTTP
   * @returns Un objet de type { message: string } avec un message de déconnexion
   * @throws Error Si le jeton est invalide ou si une erreur survient lors de la déconnexion
   */
async logout(token: string, res: Response): Promise<{ message: string }> {
    try {
      // Verify token (optional, for additional security)
      await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });

      // Add token to blacklist
      this.tokenBlacklist.add(token);

      // Clear the JWT cookie
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return { message: 'Déconnexion réussie' };
    } catch (error) {
      throw new Error('Token invalide ou erreur lors de la déconnexion');
    }
  }

  // Method to check if a token is blacklisted (for use in auth guard)
  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }




  async createUser(dto: CreateUserDto) {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }


  async getManagerList(): Promise<any> {
    return this.userRepository.find({
      where: { role: 'organisateur' },
      relations: ['forfait'],
    });
  }

  async deleteManager(id: string): Promise<{ message: string }> {
    const manager = await this.userRepository.findOne({
      where: { id },
    });

    if (!manager) {
      throw new NotFoundException(`Manager avec ID ${id} non trouvé`);
    }

    if (manager.role !== 'organisateur') {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à supprimer ce manager');
    }

    await this.eventRepository.delete({ user: { id: manager.id } });
    await this.userRepository.delete(manager.id);

    return { message: 'Organisateur supprimé avec succès' };
  }

  async updateStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      const manager = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!manager) {
        // Aucun utilisateur trouvé : on ne fait rien
        return;
      }

      await this.userRepository.update(userId, {
        isOnline,
        ...(isOnline ? { lastLogin: new Date() } : { lastLogout: new Date() }),
      });
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError?.code === '22P02') {
        // Silence complet ou log discret si tu veux :
        // console.warn(`[updateStatus] UUID invalide ignoré : ${userId}`);
        return;
      }

      // Sinon, log les autres erreurs pour debugging
      // console.error(`Erreur inattendue updateStatus userId = ${userId}`, error);
    }
  }


  async getIdForToken(userEmail) {
    if (!userEmail) {
      return "Id non trouvé";
    }

    const user = await this.userRepository.findOne({
      where: { email: userEmail },
    });

    if (!user) return "Organisateur non trouvé";

    return user.id;
  }

  async findCountUsers(): Promise<number> {
    const count = await this.userRepository.count({
      where: { role: 'organisateur' },
    });
    return count;
  }

  async findOrgStats(): Promise<any> {
    const countOrg = this.userRepository.count({
      where: { role: 'organisateur' },
    });

    const lastFiveOrganizers = this.userRepository.find({
      where: { role: 'organisateur' },
      order: { createdAt: 'DESC' }, // Assure-toi que la colonne `createdAt` existe bien
      take: 5,
      relations: ['forfait'], // optionnel, selon ce que tu veux afficher
    });

    const [count, lastOrganizers] = await Promise.all([
      countOrg,
      lastFiveOrganizers,
    ]);

    return {
      count,
      lastOrganizers,
    };
  }

  async findUserStats(): Promise<any> {
    const countTotal = this.userRepository.count();
    const countOnline = this.userRepository.count({
      where: { isOnline: true },
    });

    const [count, onlineCount] = await Promise.all([
      countTotal,
      countOnline
    ]);

    const onlinePercentage = count > 0 ? ((onlineCount / count) * 100).toFixed(2) : '0.00';

    return {
      count,
      onlinePercentage: `${onlinePercentage}`,
    };
  }

  async findSessionTimeStats(): Promise<any> {
    // Sélectionner les champs nécessaires, y compris role et lastLogin
    const users = await this.userRepository.find({
      where: { isOnline: false }, // On ne prend que les utilisateurs déconnectés pour avoir lastLogout
      select: ['id', 'email', 'lastLogin', 'lastLogout', 'role'],
    });

    const sessionStats = users
      .filter(user => user.lastLogin && user.lastLogout && new Date(user.lastLogout) > new Date(user.lastLogin)) // Vérifier que lastLogout > lastLogin
      .map(user => {
        const sessionDurationMs = new Date(user.lastLogout).getTime() - new Date(user.lastLogin).getTime();
        const sessionDurationMinutes = sessionDurationMs / (1000 * 60); // Convertir en minutes
        console.log(`User ${user.email}: lastLogin=${user.lastLogin}, lastLogout=${user.lastLogout}, duration=${sessionDurationMinutes}`); // Log pour débogage
        return {
          id: user.id,
          email: user.email,
          lastSessionDuration: sessionDurationMinutes.toFixed(2), // Durée en minutes, arrondie
          sessionStartTime: user.lastLogin, // Ajouter lastLogin comme sessionStartTime
          role: user.role, // Ajouter le rôle
        };
      });

    // Calcul de la somme totale des durées
    const totalDuration = sessionStats.reduce((sum, stat) => sum + parseFloat(stat.lastSessionDuration), 0);

    // Calcul de la moyenne globale
    const averageDuration = sessionStats.length > 0 ? (totalDuration / sessionStats.length).toFixed(2) : '0.00';

    // Ajout du pourcentage pour chaque utilisateur
    const sessionStatsWithPercentage = sessionStats.map(stat => ({
      ...stat,
      percentageOfTotalTime: totalDuration > 0 ? ((parseFloat(stat.lastSessionDuration) / totalDuration) * 100).toFixed(2) : '0.00',
    }));

    return {
      totalUsersWithSessions: sessionStats.length,
      averageSessionDuration: averageDuration, // Moyenne globale en minutes
      individualStats: sessionStatsWithPercentage, // Stats par utilisateur avec pourcentage
    };
  }


}