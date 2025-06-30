/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../entities/user.entity';

export interface GoogleUser {
  googleId: string;
  name?: string;
  email: string;
  role?: 'admin' | 'organisateur';
  photoUrl?: string | null;
  accessToken?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateOrRegisterUser(user: GoogleUser): Promise<any> {
    if (!user.email) {
      throw new Error('L\'email est requis');
    }
    let existingUser: User | null = await this.userRepository.findOneBy({ googleId: user.googleId });
    console.log('Recherche de l\'utilisateur avec googleId:', user.googleId, 'Résultat:', existingUser);
    if (!existingUser) {
      existingUser = this.userRepository.create({
        googleId: user.googleId,
        name: user.name || 'Unknown',
        email: user.email,
        role: user.role || 'organisateur',
        photoUrl: user.photoUrl ?? null,
        accessToken: user.accessToken ?? null,
      } as DeepPartial<User>);
      existingUser = await this.userRepository.save(existingUser);
      console.log('Nouvel utilisateur créé et sauvegardé:', existingUser);
    } else if (user.accessToken) {
      existingUser.accessToken = user.accessToken;
      existingUser = await this.userRepository.save(existingUser);
      console.log('Utilisateur mis à jour:', existingUser);
    }
    return this.generateToken(existingUser);
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  private generateToken(user: User): any {
    const payload = { email: user.email, sub: user.googleId, role: user.role };
    return {
      id: user.id,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      role: user.role,
      photoUrl: user.photoUrl,
      access_token: this.jwtService.sign(payload),
    };
  }
}