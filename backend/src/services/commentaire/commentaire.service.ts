import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Commentaire, SatisfactionLevel } from 'src/entities/Commentaire';
import { CreateCommentaireDto } from 'src/dto/create-commentaire.dto';
import { UpdateCommentaireDto } from 'src/dto/update-commentaire.dto';
import { IsNotIn } from 'class-validator';

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
    commentaire.userName = user.name || null; 
    commentaire.userPhoto = user.photo || null;
    commentaire.satisfaction=createCommentaireDto.satisfaction  || SatisfactionLevel.DECEVANT;

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
  
  async findOneRecent(){
    return this.commentaireRepository.findOne({
    where:{},
     order:{createdAt:'DESC'},
    })
  }


  /**
   * 
   * @returns 
   * 
   * recuperation des 3 dernieres commentaire avec des different user
   * 
   * 
   */

  async findDifferentCommentaireFromUser  () {
    return this.commentaireRepository
    .createQueryBuilder('commentaire')
   .distinctOn(['commentaire.userEmail'])
   .orderBy('commentaire.userEmail','ASC') 
    .addOrderBy('commentaire.userEmail','DESC')
    .limit(3)
    .getMany();
  }


  /**
   * 
   * @returns 
   * 
   * commentaire recent avant le dernier commentaire
   * 
   * 
   */

  async findSecondToLastCommentaireFromUser  () {
    return this.commentaireRepository
    .createQueryBuilder('commentaire')
    .orderBy('commentaire.createdAt', 'DESC')
     .offset(1)
    .limit(1)
    .getOne();
  }

  /**
   * 
   * @returns 
   * commentaire recent avant les 2 dernier commentaire
   * 
   * 
   */
  async findThirdToLastCommentaireFromUser  () {
    return this.commentaireRepository
    .createQueryBuilder('commentaire')
    .orderBy('commentaire.createdAt', 'DESC')
     .offset(2)
    .limit(1)
    .getOne();
  }


  /**
   * 
   * @returns 
   * commentaire recent avant les 3 derner commentaire
   * 
   * 
   */

  async findFourthToLastCommentaireFromUser  () {
    return this.commentaireRepository
   .createQueryBuilder('commentaire')
    .orderBy('commentaire.createdAt', 'DESC')
     .offset(3)
    .limit(1)
    .getOne();
  
  }


  /**
   * 
   * @returns 
   * 
   * recuperation du nombre de commentaire satisfait
   * 
   * 
   */
  async findCountSatisfaction(){
    const count= this.commentaireRepository.count({
      where:{
        satisfaction:Not(SatisfactionLevel.DECEVANT),
      }
    });
    return count;
  }

  /**
   * 
   * @returns 
   * pourcentage de satisfaction
   * 
   * 
   * On récupére le nombre de commentaire satisfait
   * On vérifie si il y a au moins un commentaire satisfait
   * sinon on renvoie 0
   * Sinon on récupére le nombre de commentaire global
   * Et on calcule le pourcentage de satisfaction
   */
  async findCount_pourcentageSatisfaction():Promise<number>{
   const count_Issatisf= await this.commentaireRepository.count({
     where:{
       satisfaction:Not(SatisfactionLevel.DECEVANT),
     }
   });
   if(count_Issatisf===0){
     return 0;
   }
   const count_global_satisfaction= await this.commentaireRepository.count();
   const pourcentage= (count_Issatisf*100)/count_global_satisfaction;
   return pourcentage;
  }
}