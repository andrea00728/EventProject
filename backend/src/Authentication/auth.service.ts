
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { User } from './entities/auth.entity';
import { CreateUserDto } from './dto/create-auth.dto';
import { Personnel } from 'src/entities/Personnel';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
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
}