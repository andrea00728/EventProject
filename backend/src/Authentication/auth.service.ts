
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
    private readonly forfaitRepository:Repository<Forfait>
  ) {}



  /***
   * 
   * natoko commentaire lony satria ito efa mande fa anao test  na role ao
   */
// async validateUser(profile: any): Promise<any> {
//   const { emails, displayName, photos } = profile;
//   const email = emails[0].value;

//   // Vérifie si l'email existe dans `personnel`
//   const personnel = await this.personnelRepository.findOne({
//     where: { email },
//     relations: ['evenement'],
//   });

//   const role = personnel?.role || 'organisateur';
//   // Vérifie si déjà dans users
//   let user = await this.userRepository.findOne({ where: { email } });

//   if (!user) {
//     //  Trouve le forfait freemium (id 11)
//     const freemium = await this.forfaitRepository.findOne({ where: { id: 11 } });

//     if (!freemium) {
//       throw new Error('Forfait freemium non trouvé'); // Sécurité
//     }

//     user = this.userRepository.create({
//       id: uuidv4(),
//       email,
//       name: displayName,
//       photo: photos?.[0]?.value || '',
//       role,
//       forfait: {id:11} as Forfait, //  Lien vers le forfait freemium
//     });

//     await this.userRepository.save(user);
//   }

//   return user;
// }


async validateUser(profile: any): Promise<any> {
  const { emails, displayName, photos } = profile;
  const email = emails[0].value;
  const personnel = await this.personnelRepository.findOne({
    where: { email },
    relations: ['evenement'],
  });

  // const role = personnel?.role || 'organisateur';

  const isInPersonnel=!!personnel;
  const  isdetectedRole=isInPersonnel?personnel.role:'organisateur';

  let user = await this.userRepository.findOne({ where: { email } });

  if (!user) {
    const freemium = await this.forfaitRepository.findOne({ where: { id: 11 } });

    if (!freemium) {
      throw new Error('Forfait freemium non trouvé'); // Sécurité
    }

    user = this.userRepository.create({
      id: uuidv4(),
      email,
      name: displayName,
      photo: photos?.[0]?.value || '',
      role: isdetectedRole,
      forfait: {id:11} as Forfait, 
    });

    await this.userRepository.save(user);
  }

  return {
    ...user,
    role: isdetectedRole,
    isInPersonnel,
  }
}


async status(user : any) {
  let userLogIn = await this.userRepository.findOne({ where: { id : user.id } });
  if (!userLogIn) {
    throw new NotFoundException(`Non identifié`);
  }

  userLogIn.isOnline = true;
  userLogIn.lastLogin = new Date();

  await this.userRepository.save(userLogIn)

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
    await this.eventRepository.delete({ user: { id: manager.id } }); 
    await this.userRepository.delete(manager.id);

    return { message: 'Organisateur supprimé avec succès' };
  }

}