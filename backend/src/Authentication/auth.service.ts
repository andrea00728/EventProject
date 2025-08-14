import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Repository, QueryFailedError, In } from 'typeorm';
import { User } from './entities/auth.entity';
import { CreateUserDto } from './dto/create-auth.dto';
import { Personnel } from 'src/entities/Personnel';
import { Evenement } from 'src/entities/Evenement';
import { Forfait } from 'src/entities/Forfait';
import admin from 'src/firebase/firebase-admin';
import { NotificationEntity } from 'src/entities/notification.entity';
import { ContactMessage } from 'src/entities/ContactMessage';
import axios from 'axios';


@Injectable()
export class AuthService {
  emailVerificationService: any;
  

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
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(ContactMessage)
    private readonly contact_messages: Repository<ContactMessage>,
  ) { }


  async replyToMessage(email: string, message: string) {
    const isValidEmail = await this.emailVerificationService.verifyEmailWithAPI(email);
    if (!isValidEmail) {
      throw new Error('Email invalide ou injoignable');
    }
    // TODO: envoyer le message par email (nodemailer, etc.)
  }
  
  async validateUser(profile: any): Promise<any> {
    const { emails, displayName, photos } = profile;
    const email = emails[0].value;

    // Vérification dans Personnel
    const personnel = await this.personnelRepository.findOne({
      where: { email },
      relations: ['evenement'],
    });

    const isInPersonnel = !!personnel;
    const isdetectedRole = isInPersonnel ? personnel.role : 'organisateur';

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
    }

    if (isdetectedRole === 'organisateur') {
      const notification = this.notificationRepository.create({
        title: 'Nouvel organisateur inscrit',
        message: `L'organisateur ${displayName || email} s'est inscrit.`,
        type: 'info',
      });
      await this.notificationRepository.save(notification);
    } else {
      user.name = displayName || null;
      user.photo = photos?.[0]?.value || null;
      user.role = isdetectedRole;
      await this.userRepository.save(user);
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
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createUser(dto: CreateUserDto) {
    const user = this.userRepository.create(dto);
    if (dto.role === 'organisateur') {
      const notification = this.notificationRepository.create({
        title: 'Nouvel organisateur inscrit',
        message: `L'organisateur ${dto.name || dto.email} s'est inscrit.`,
        type: 'info',
      });
      await this.notificationRepository.save(notification);
    }
    return this.userRepository.save(user);
  }

  async logout(user: any) {
    return { message: 'Déconnexion réussie' };
  }

  async getManagerList(): Promise<any> {
    return this.userRepository.find({
      where: { role: 'organisateur' },
      relations: ['forfait'],
    });
  }

  async deleteManager(id: string): Promise<{ message: string }> {
    const manager = await this.userRepository.findOne({ where: { id } });

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
      const manager = await this.userRepository.findOne({ where: { id: userId } });
      if (!manager) return;
      await this.userRepository.update(userId, {
        isOnline,
        ...(isOnline ? { lastLogin: new Date() } : { lastLogout: new Date() }),
      });
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError?.code === '22P02') {
        return;
      }
    }
  }

  async getIdForToken(userEmail: string) {
    if (!userEmail) return "Id non trouvé";

    const user = await this.userRepository.findOne({ where: { email: userEmail } });
    if (!user) return "Organisateur non trouvé";
    return user.id;
  }

  async findCountUsers(): Promise<number> {
    return this.userRepository.count({ where: { role: 'organisateur' } });
  }

  async findOrgStats(): Promise<any> {
    const countOrg = this.userRepository.count({ where: { role: 'organisateur' } });
    const lastFiveOrganizers = this.userRepository.find({
      where: { role: 'organisateur' },
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['forfait'],
    });

    const [count, lastOrganizers] = await Promise.all([countOrg, lastFiveOrganizers]);

    return { count, lastOrganizers };
  }

  async loginWithFirebase(idToken: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const email = decodedToken.email;
      const displayName = decodedToken.name || 'Admin';
      const photoURL = decodedToken.picture || null;

      let adminUser = await this.userRepository.findOne({
        where: { email, role: 'admin' },
      });

      if (!adminUser) {
        const adminCount = await this.userRepository.count({ where: { role: 'admin' } });
        if (adminCount > 0) throw new UnauthorizedException('Un admin existe déjà');

        adminUser = this.userRepository.create({
          id: uuidv4(),
          email,
          name: displayName,
          photo: photoURL,
          role: 'admin',
          isOnline: true,
          lastLogin: new Date(),
        } as Partial<User>);

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
      throw new UnauthorizedException('Token Firebase invalide ou autre erreur');
    }
  }

  async findUserStats(): Promise<any> {
    const countTotal = this.userRepository.count();
    const countOnline = this.userRepository.count({ where: { isOnline: true } });
    const [count, onlineCount] = await Promise.all([countTotal, countOnline]);

    const onlinePercentage = count > 0 ? ((onlineCount / count) * 100).toFixed(2) : '0.00';

    return { count, onlinePercentage: `${onlinePercentage}` };
  }

  async findSessionTimeStats(): Promise<any> {
    const users = await this.userRepository.find({
      where: { isOnline: false },
      select: ['id', 'email', 'lastLogin', 'lastLogout', 'role'],
    });

    const sessionStats = users
      .filter(u => u.lastLogin && u.lastLogout && new Date(u.lastLogout) > new Date(u.lastLogin))
      .map(user => {
        const durationMs = new Date(user.lastLogout).getTime() - new Date(user.lastLogin).getTime();
        const durationMinutes = durationMs / (1000 * 60);
        return {
          id: user.id,
          email: user.email,
          lastSessionDuration: durationMinutes.toFixed(2),
          sessionStartTime: user.lastLogin,
          role: user.role,
        };
      });

    const totalDuration = sessionStats.reduce((sum, stat) => sum + parseFloat(stat.lastSessionDuration), 0);
    const averageDuration = sessionStats.length > 0 ? (totalDuration / sessionStats.length).toFixed(2) : '0.00';

    const sessionStatsWithPercentage = sessionStats.map(stat => ({
      ...stat,
      percentageOfTotalTime: totalDuration > 0 ? ((parseFloat(stat.lastSessionDuration) / totalDuration) * 100).toFixed(2) : '0.00',
    }));

    return {
      totalUsersWithSessions: sessionStats.length,
      averageSessionDuration: averageDuration,
      individualStats: sessionStatsWithPercentage,
    };
  }

  async getUserRoleStats(): Promise<{ role: string; count: number }[]> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    return result.map(r => ({ role: r.role, count: parseInt(r.count) }));
  }

  async getMonthlyRegistrations(): Promise<{ month: string; count: number }[]> {
    const currentYear = new Date().getFullYear();
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    const monthlyResults = await this.userRepository
      .createQueryBuilder('user')
      .select("TO_CHAR(user.createdAt, 'Mon')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('user.role IN (:...roles)', { roles: ['organisateur', 'accueil'] })
      .andWhere('EXTRACT(YEAR FROM user.createdAt) = :year', { year: currentYear })
      .groupBy('month')
      .orderBy('MIN(EXTRACT(MONTH FROM user.createdAt))')
      .getRawMany();

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const lastThreeMonthsCount = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role IN (:...roles)', { roles: ['organisateur', 'accueil'] })
      .andWhere('user.createdAt >= :date', { date: threeMonthsAgo })
      .getCount();

    const formattedData = monthNames.slice(0, 6).map(month => {
      const found = monthlyResults.find(r => r.month.toLowerCase() === month.toLowerCase());
      return {
        month,
        count: found ? parseInt(found.count) : 0,
      };
    });

    formattedData.push({ month: '3 derniers mois', count: lastThreeMonthsCount });

    return formattedData;
  }

  async getNotifications(): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      order: { date: 'DESC' },
      take: 10,
    });
  }

  async getUnreadNotifications(): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      where: { isRead: false },
      order: { date: 'DESC' },
      take: 10,
    });
  }


  async getMessages(): Promise<ContactMessage[]> {
    return this.contact_messages.find({
      order: { createdAt: 'DESC' },
    });
  }

 // auth.service.ts
  async deleteMessage(id: number): Promise<void> {
    await this.contact_messages.delete(id);
  }



  async markNotificationsRead(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    await this.notificationRepository.update(ids, { isRead: true });
  }

  

}
