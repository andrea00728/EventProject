import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { UserEventRole } from '../entities/user-event-role.entity';
import { Role } from '../entities/role.entity';
import { Evenement } from '../entities/Evenement';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserEventRole)
    private readonly userEventRoleRepository: Repository<UserEventRole>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Evenement)
    private readonly evenementRepository: Repository<Evenement>,
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

      // Attribuer le rôle 'client' par défaut pour tous les événements existants
      const clientRole = await this.roleRepository.findOne({ where: { name: 'client' } });
      if (!clientRole) throw new NotFoundException('Role client not found');
      const evenements = await this.evenementRepository.find();
      for (const evenement of evenements) {
        const userEventRole = this.userEventRoleRepository.create({
          user,
          evenement,
          role: clientRole,
        });
        await this.userEventRoleRepository.save(userEventRole);
      }
    }

    const userRoles = await this.userEventRoleRepository.find({
      where: { user: { id } },
      relations: ['evenement', 'role'],
    });

    return {
      ...user,
      roles: userRoles.map((ur) => ({ eventId: ur.evenement.id, role: ur.role.name })),
    };
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async updateUserRole(userId: string, eventId: number, roleName: 'admin' | 'cuisine' | 'caisse' | 'client') {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const evenement = await this.evenementRepository.findOne({ where: { id: eventId } });
    if (!evenement) throw new NotFoundException(`Event with ID ${eventId} not found`);

    const role = await this.roleRepository.findOne({ where: { name: roleName } });
    if (!role) throw new BadRequestException(`Invalid role: ${roleName}`);

    let userEventRole = await this.userEventRoleRepository.findOne({
      where: { user: { id: userId }, evenement: { id: eventId } },
    });

    if (userEventRole) {
      userEventRole.role = role;
    } else {
      userEventRole = this.userEventRoleRepository.create({
        user,
        evenement,
        role,
      });
    }

    await this.userEventRoleRepository.save(userEventRole);

    const userRoles = await this.userEventRoleRepository.find({
      where: { user: { id: userId } },
      relations: ['evenement', 'role'],
    });

    return {
      ...user,
      roles: userRoles.map((ur) => ({ eventId: ur.evenement.id, role: ur.role.name })),
    };
  }
}