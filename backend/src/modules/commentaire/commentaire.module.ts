import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commentaire } from 'src/entities/Commentaire';
import { CommentaireService } from 'src/services/commentaire/commentaire.service';
import { CommentaireController } from 'src/controllers/commentaire/commentaire.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Commentaire])],
  providers: [CommentaireService],
  controllers: [CommentaireController],
})
export class CommentaireModule {}