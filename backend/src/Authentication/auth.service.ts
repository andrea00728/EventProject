import { BadRequestException, Injectable, NotFoundException, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
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
import * as bcrypt from 'bcrypt'
import axios from 'axios';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { NotificationGateway } from 'src/gateway/notification.gateway';
import { Admin } from 'src/entities/Admin';
import * as nodemailer from 'nodemailer';


@Injectable()
export class AuthService {
  emailVerificationService: any;
  private transporter: nodemailer.Transporter;

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
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRedis()
    private readonly redis: Redis,
    private readonly notificationGateway: NotificationGateway,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }


  async replyToMessage(email: string, message: string) {
    const isValidEmail = await this.emailVerificationService.verifyEmailWithAPI(email);
    if (!isValidEmail) {
      throw new Error('Email invalide ou injoignable');
    }
    // TODO: envoyer le message par email (nodemailer, etc.)
  }



  /**
   * 
   * @param user 
   * @param res 
   * @returns 
   * 
   * amelioration pour login pout utilise cookies
   */

  async login(user: any, res: Response) {
    try {
      // Vérifier si c'est un admin
      const adminIsExist = await this.adminRepository.findOne({
        where: { email: user?.email },
      });
  
      if (adminIsExist) {
        return { error: "c'est un email d'un administrateur" };
      }
  
      // Vérifier si l'utilisateur est déjà marqué comme vérifié
      if (!user.isVerified) {
        user.isVerified = true;
        await this.userRepository.save(user); // on met à jour la colonne dans la DB
      }
  
      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        name: user.name,
        photo: user.photo,
      };
  
      const access_token = this.jwtService.sign(payload, { expiresIn: '1h' });
      const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
  
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
  
      console.log('✅ JWT Payload:', payload);
  
      return { access_token, refresh_token };
    } catch (error) {
      console.error('❌ Erreur login():', error.message);
      return { error: error.message };
    }
  }
  




  /**
   * 
   * @param req 
   * @param res 
   * @returns 
   * 
   * pour frech le token 
   * 
   */
  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken || await this.isTokenBlacklisted(refreshToken)) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const payload = await this.jwtService.verifyAsync(refreshToken);

    const newAccessToken = this.jwtService.sign(
      {
        email: payload.email,
        sub: payload.sub,
        role: payload.role,
        name: payload.name,
        photo: payload.photo,
      },
      { expiresIn: '1h' },
    );

    res.cookie('jwt', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    return { access_token: newAccessToken };
  }


  /**
   * 
   * @param token 
   * @param res 
   * @returns 
   * 
   * deconnexion
   */
  async logout(req: Request, res: Response): Promise<{ message: string }> {
    try {
      const jwtCookie = req.cookies['jwt']; // Récupérer le jeton directement du cookie
      if (!jwtCookie) {
        throw new Error('Aucun jeton fourni');
      }

      await this.jwtService.verifyAsync(jwtCookie, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });

      await this.redis.set(`blacklist:${jwtCookie}`, 'true', 'EX', 24 * 60 * 60);

      // ... Le reste de votre code pour effacer les cookies
      res.clearCookie('jwt', { /* options */ });
      res.clearCookie('refresh_token', { /* options */ });

      return { message: 'Déconnexion réussie' };
    } catch (error) {
      throw new Error('Token invalide ou erreur lors de la déconnexion');
    }
  }



  /**
   * 
   * @param token 
   * @returns 
   * 
   * blacklist token
   */

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const isBlacklisted = await this.redis.get(`blacklist:${token}`);
    return !!isBlacklisted;
  }





  async createUser(dto: CreateUserDto) {
    // Crée une nouvelle instance User avec les données du DTO
    const user = this.userRepository.create(dto);
  
    // On force la vérification directement
    user.isVerified = true;
  
    // Si c’est un organisateur, on génère une notification
    if (dto.role === 'organisateur') {
      const notification = this.notificationRepository.create({
        title: 'Nouvel organisateur inscrit',
        message: `L'organisateur ${dto.name || dto.email} s'est inscrit.`,
        type: 'info',
      });
      await this.notificationRepository.save(notification);
    }
  
    // On enregistre l’utilisateur
    return this.userRepository.save(user);
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
          isVerified: true, // ✅ déjà marqué comme vérifié
        } as Partial<User>);
  
        await this.userRepository.save(adminUser);
      } else {
        // ✅ Si l’admin existe déjà mais n’est pas vérifié, on le met à jour
        if (!adminUser.isVerified) {
          adminUser.isVerified = true;
          await this.userRepository.save(adminUser);
        }
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
          isVerified: adminUser.isVerified, // 👈 utile côté front
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



  async updateProfile(
    userId: string,
    data: {
      name: string;
      email: string;
      currentPassword?: string;
      newPassword?: string;
      newPasswordConfirmation?: string;
      photo?: string | null;
    },
  ): Promise<{ user: User; token?: string }> { // Modifier pour renvoyer user et token
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await this.userRepository.findOne({ where: { email: data.email } });
      if (emailExists) {
        throw new BadRequestException('Cet email est déjà utilisé');
      }
      user.email = data.email;
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new BadRequestException('Mot de passe actuel requis pour changer le mot de passe');
      }
      const isMatch = await bcrypt.compare(data.currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Mot de passe actuel incorrect');
      }
      if (data.newPassword !== data.newPasswordConfirmation) {
        throw new BadRequestException('Les nouveaux mots de passe ne correspondent pas');
      }
      user.password = await bcrypt.hash(data.newPassword, 10);
    }

    if (data.name) {
      user.name = data.name;
    }
    if (data.photo) {
      user.photo = `/uploads/${data.photo}`; // Stocker le chemin relatif
    }

    await this.userRepository.save(user);

    // Ajout : Générer un nouveau token JWT avec les données mises à jour
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      // photo: user.photo ? `https://api.mastertable.site${user.photo}` : null,
      photo: user.photo ? `https://api.mastertable.site${user.photo}` : null,
    };
    const newToken = this.jwtService.sign(payload);

    // Log pour débogage
    console.log('Utilisateur mis à jour:', {
      id: user.id,
      name: user.name,
      email: user.email,
      // photo: user.photo ? `https://api.mastertable.site${user.photo}?t=${Date.now()}` : null,
      photo: user.photo ? `https://api.mastertable.site${user.photo}?t=${Date.now()}` : null,
    });

    return {
      user: {
        ...user,
        // photo: user.photo ? `https://api.mastertable.site${user.photo}?t=${Date.now()}` : null,
        photo: user.photo ? `https://api.mastertable.site${user.photo}?t=${Date.now()}` : null,
      } as User,
      token: newToken, // Retourner le nouveau token
    };
  }

  // Ajout : Méthode pour /auth/status
  async getStatus(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    // Log pour débogage
    console.log('Statut utilisateur:', {
      id: user.id,
      name: user.name,
      email: user.email,
      // photo: user.photo ? `https://api.mastertable.site${user.photo}?t=${Date.now()}` : null,
      photo: user.photo ? `https://api.mastertable.site${user.photo}?t=${Date.now()}` : null,
    });
    return {
      ...user,
      // photo: user.photo ? `https://api.mastertable.site${user.photo}?t=${Date.now()}` : null,
      photo: user.photo ? `https://api.mastertable.site${user.photo}?t=${Date.now()}` : null,
    } as User;
  }




  //modif de ilaina
  async registerUser(data: { name: string; email: string; password: string; photo?: string }) {
    const { name, email, password, photo } = data;

    const adminIsExist = await this.adminRepository.findOne({ where: { email } });
    if (adminIsExist) {
      throw new BadRequestException("Cet email appartient à un administrateur");
    }

    const personnel = await this.personnelRepository.findOne({
      where: { email },
      relations: ['evenement'],
    });

    const isInPersonnel = !!personnel;
    const isdetectedRole = isInPersonnel ? personnel.role : 'organisateur';

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    const freemium = await this.forfaitRepository.findOne({ where: { id: 11 } });
    if (!freemium) {
      throw new BadRequestException('Forfait freemium non trouvé');
    }

    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      photo: photo || null,
      role: isdetectedRole,
      forfait: freemium,
      isVerified: false,
      verificationCode,
    });

    try {
      await this.userRepository.save(newUser);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Vérifiez votre adresse email',
        html: `
          <h2>Bienvenue, ${name} !</h2>
          <p>Veuillez vérifier votre adresse email en utilisant le code suivant :</p>
          <h3>${verificationCode}</h3>
          <p>Entrez ce code dans l'application pour activer votre compte.</p>
          <p>Ce code expire dans 1 heure.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);

      await this.redis.set(`verify:${email}`, verificationCode, 'EX', 3600);

      const notification = this.notificationRepository.create({
        title: 'Nouvel organisateur inscrit',
        message: `L'organisateur ${name || email} s'est inscrit. En attente de vérification.`,
        type: 'info',
        date: new Date(),
      });
      await this.notificationRepository.save(notification);
      this.notificationGateway.emitNotifRegisterToAdmin({
        ...notification,
        date: notification.date.toISOString(),
      });

      return {
        message: 'Utilisateur créé avec succès. Veuillez vérifier votre email.',
        userId: newUser.id,
      };
    } catch (error) {
      await this.userRepository.delete(newUser.id);
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new BadRequestException('Erreur lors de l\'envoi de l\'email de vérification: ' + error.message);
    }
  }

  async verifyEmail(email: string, code: string): Promise<{ message: string }> {
    const storedCode = await this.redis.get(`verify:${email}`);
    if (!storedCode || storedCode !== code) {
      throw new BadRequestException('Code de vérification invalide ou expiré');
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    user.isVerified = true;
    user.verificationCode = null;
    await this.userRepository.save(user);

    await this.redis.del(`verify:${email}`);

    return { message: 'Email vérifié avec succès' };
  }


  async loginUser(email: string, password: string, res: Response) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Email ou mot de passe incorrect');
    if (!user.isVerified) throw new BadRequestException('Veuillez vérifier votre email avant de vous connecter');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequestException('Email ou mot de passe incorrect');

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name, photo: user.photo };
    const access_token = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo ? `https://api.mastertable.site${user.photo}` : null,
      },
    };
  }

  async validateUser(profile: any): Promise<any> {
    try {
      const { emails, displayName, photos } = profile;
      const email = emails[0].value;

      const adminIsExist = await this.adminRepository.findOne({ where: { email } });
      if (adminIsExist) {
        return { error: "c'est un email d'un administrateur" };
      }

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
          isVerified: true,
        });

        await this.userRepository.save(user);
        const notification = this.notificationRepository.create({
          title: 'Nouvel organisateur inscrit',
          message: `L'organisateur ${displayName || email} s'est inscrit via Google.`,
          type: 'info',
          date: new Date(),
        });
        await this.notificationRepository.save(notification);
        this.notificationGateway.emitNotifRegisterToAdmin({
          ...notification,
          date: notification.date.toISOString(),
        });
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
    } catch (error) {
      console.error('Erreur dans validateUser:', error);
      throw error;
    }
  }
  
}