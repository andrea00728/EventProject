/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> { // Changé de User | undefined à User | null
    return this.userRepository.findOneBy({ email });
  }

  async createOrUpdate(user: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ email: user.email });
    if (existingUser) {
      return this.userRepository.save({ ...existingUser, ...user });
    }
    return this.userRepository.save(user);
  }
}