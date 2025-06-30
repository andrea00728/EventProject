
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { User } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUser(profile: any): Promise<any> {
    const { id, emails, displayName, photos } = profile;
    let user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      user = this.userRepository.create({
        id,
        email: emails[0].value,
        name: displayName,
        photo: photos?.[0]?.value || null,
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}