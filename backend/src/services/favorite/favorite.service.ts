import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from 'src/entities/Favorite';
import { Evenement } from 'src/entities/Evenement';
import { User } from 'src/Authentication/entities/auth.entity';
import { CreateFavoriteDto } from 'src/dto/create-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

   async addFavorite(createFavoriteDto: CreateFavoriteDto) {
    if (!createFavoriteDto) {
      throw new Error('Le corps de la requête est vide');
    }

    const { evenementId, note } = createFavoriteDto;

    if (!evenementId) {
      throw new Error('evenementId est manquant');
    }

    // Simule l'enregistrement du favori (à remplacer par ta logique ORM ou base de données)
    const nouveauFavori = {
      evenementId,
      note: note || null,
      dateAjout: new Date().toISOString(),
    };

    console.log('Favori ajouté :', nouveauFavori);

    return {
      message: 'Favori ajouté avec succès',
      data: nouveauFavori,
    };
  }

  async removeFavorite(userId: string, evenementId: number): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, evenement: { id: evenementId } },
    });
    if (!favorite) {
      throw new NotFoundException('Favori non trouvé');
    }

    await this.favoriteRepository.remove(favorite);
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['evenement'],
      order: { createdAt: 'DESC' },
    });
  }
}