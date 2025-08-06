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

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
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

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      name: user.name,
      photo: user.photo,
    };
    console.log('JWT Payload:', payload);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createUser(dto: CreateUserDto) {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async logout(user: any) {
    const token = this.jwtService.sign({}, { expiresIn: '1s' });
    return { message: 'Déconnexion réussie' };
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