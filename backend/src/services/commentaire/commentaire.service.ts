import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commentaire, SatisfactionLevel } from 'src/entities/Commentaire';
import { CreateCommentaireDto } from 'src/dto/create-commentaire.dto';
import { UpdateCommentaireDto } from 'src/dto/update-commentaire.dto';

@Injectable()
export class CommentaireService {
  constructor(
    @InjectRepository(Commentaire)
    private commentaireRepository: Repository<Commentaire>,
  ) {}

  async create(createCommentaireDto: CreateCommentaireDto, user: any) {
    const commentaire = new Commentaire();
    commentaire.contenu = createCommentaireDto.contenu;
    commentaire.userEmail = user.email;
    commentaire.satisfaction=createCommentaireDto.satisfaction;
    commentaire.userName = user.name || null; // Nullable
    commentaire.userPhoto = user.photo || null; // Nullable
    commentaire.satisfaction=createCommentaireDto.satisfaction  || SatisfactionLevel.SATISFAIT;

    return this.commentaireRepository.save(commentaire);
  }

  findAll() {
    return this.commentaireRepository.find();
  }

  findOne(id: number) {
    return this.commentaireRepository.findOneBy({ id });
  }

  async update(id: number, updateCommentaireDto: UpdateCommentaireDto, user: any) {
    const commentaire = await this.commentaireRepository.findOneBy({ id });

    if (!commentaire) {
      throw new NotFoundException('Commentaire not found');
    }

    if (commentaire.userEmail !== user.email) {
      throw new UnauthorizedException('Unauthorized to update this commentaire');
    }

    return this.commentaireRepository.update(id, {
      contenu: updateCommentaireDto.contenu,
    });
  }

  async remove(id: number, user: any) {
    const commentaire = await this.commentaireRepository.findOneBy({ id });

    if (!commentaire) {
      throw new NotFoundException('Commentaire not found');
    }

    if (commentaire.userEmail !== user.email) {
      throw new UnauthorizedException('Unauthorized to delete this commentaire');
    }

    return this.commentaireRepository.delete(id);
  }


  /**
   * 
   * @returns 
   * 
   * recuperation du dernier commentaire ajouter par des organisateur active
   */
  
  findOneRecent(){
    return this.commentaireRepository.findOne({
    where:{},
     order:{createdAt:'DESC'},
    })
  }

}