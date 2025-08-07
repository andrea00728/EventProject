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
  
  /**
   * 
   * @returns 
   * Les statistiques de satisfaction.
   * 
   * La méthode renvoie un objet avec les clés suivantes :
   * - decevant : le pourcentage de commentaires décevants
   * - moyen : le pourcentage de commentaires moyens
   * - bien : le pourcentage de commentaires satisfaisants
   * - tres_bien : le pourcentage de commentaires très satisfaits
   * - excellent : le pourcentage de commentaires excellents
   * 
   * Si il n'y a pas de commentaire, la méthode renvoie un objet avec toutes les valeurs à 0.
   * 
   */
  async findSatisfactionStatistics() {
    const totalComments = await this.commentaireRepository.count();
    
    if (totalComments === 0) {
      return {
        decevant: 0,
        moyen: 0,
        bien: 0,
        tres_bien: 0,
        excellent: 0,
      };
    }

    const counts = await Promise.all([
      this.commentaireRepository.count({ where: { satisfaction: SatisfactionLevel.DECEVANT } }),
      this.commentaireRepository.count({ where: { satisfaction: SatisfactionLevel.MOYEN } }),
      this.commentaireRepository.count({ where: { satisfaction: SatisfactionLevel.BIEN } }),
      this.commentaireRepository.count({ where: { satisfaction: SatisfactionLevel.TRES_BIEN } }),
      this.commentaireRepository.count({ where: { satisfaction: SatisfactionLevel.EXELLENT } }),
    ]);

    return {
      decevant: Number(((counts[0] / totalComments) * 100).toFixed(2)),
      moyen: Number(((counts[1] / totalComments) * 100).toFixed(2)),
      bien: Number(((counts[2] / totalComments) * 100).toFixed(2)),
      tres_bien: Number(((counts[3] / totalComments) * 100).toFixed(2)),
      excellent: Number(((counts[4] / totalComments) * 100).toFixed(2)),
    };
  }
}