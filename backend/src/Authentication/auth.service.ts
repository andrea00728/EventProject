
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { User } from './entities/auth.entity';
import { CreateUserDto } from './dto/create-auth.dto';
import { Personnel } from 'src/entities/Personnel';
import { Evenement } from 'src/entities/Evenement';

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
  ) {}


async validateUser(profile: any): Promise<any> {
  const { emails, displayName, photos } = profile;
  const email = emails[0].value;

  // Vérifie si l'email existe dans `personnel`
  const personnel = await this.personnelRepository.findOne({
    where: { email },
    relations: ['evenement'],
  });

  const role = personnel?.role || 'organisateur';
  // Vérifie si déjà dans users
  let user = await this.userRepository.findOne({ where: { email } });

  if (!user) {
    user = this.userRepository.create({
      id: uuidv4(),
      email,
      name: displayName,
      photo: photos?.[0]?.value || '',
      role, 
    });

    await this.userRepository.save(user);
  }

  return user;
}

  async login(user: any) {
  const payload = { 
    email: user.email,
    sub: user.id,
    role: user.role,
  };

  return {
    access_token: this.jwtService.sign(payload),
  };
}


  async createUser(dto:CreateUserDto){
    const user=this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async getManagerList(): Promise<any> {
    return this.userRepository.find({
      where: { role: 'organisateur' }
    });
  }

  async deleteManager(id: string): Promise<{ message: string }> {
    // Récupérer le manager avec ses relations si nécessaire
    const manager = await this.userRepository.findOne({
      where: { id },
    });

    if (!manager) {
      throw new NotFoundException(`Manager avec ID ${id} non trouvé`);
    }

    // Vérifier que l'utilisateur est bien un organisateur
    if (manager.role !== 'organisateur') {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à supprimer ce manager');
    }

    console.log(manager)

    // Supprimer le manager lui-même
    await this.eventRepository.delete({ user: { id: manager.id } }); // Supprimer les événements liés
    await this.userRepository.delete(manager.id);

    return { message: 'Organisateur supprimé avec succès' };
  }

}