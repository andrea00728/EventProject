
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { User } from './entities/auth.entity';
import { CreateUserDto } from './dto/create-auth.dto';
import { Personnel } from 'src/entities/Personnel';
import { Forfait } from 'src/entities/Forfait';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
    @InjectRepository(Forfait)
    private readonly forfaitRepository:Repository<Forfait>
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
    //  Trouve le forfait freemium (id 11)
    const freemium = await this.forfaitRepository.findOne({ where: { id: 11 } });

    if (!freemium) {
      throw new Error('Forfait freemium non trouvé'); // Sécurité
    }

    user = this.userRepository.create({
      id: uuidv4(),
      email,
      name: displayName,
      photo: photos?.[0]?.value || '',
      role,
      forfait: {id:11} as Forfait, //  Lien vers le forfait freemium
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
}