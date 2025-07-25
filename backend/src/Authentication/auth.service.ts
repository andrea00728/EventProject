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
  ) {}

  async validateUser(profile: any): Promise<any> {
    const { emails, displayName, photos } = profile;
    const email = emails[0].value;
    console.log('Google Profile Data:', { email, displayName, photos }); // Log pour déboguer

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
    } else {
      // Mettre à jour name et photo si nécessaire
      if (user.name !== displayName || user.photo !== (photos?.[0]?.value || null)) {
        user.name = displayName || null;
        user.photo = photos?.[0]?.value || null;
        await this.userRepository.save(user);
      }
    }

    return {
      ...user,
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
    console.log('JWT Payload:', payload); // Log pour déboguer
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


  /**
   * 
   * @returns 
   * 
   * nombre totale d'organisateur
   */

  async findCountUsers():Promise<number>{
    const count= this.userRepository.count({
      where: {
        role: 'organisateur',
      },
    });
    return count;
  }
}