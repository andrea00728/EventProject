import { Test, TestingModule } from '@nestjs/testing';
import { CommentaireController } from './commentaire.controller';

describe('CommentaireController', () => {
  let controller: CommentaireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentaireController],
    }).compile();

    controller = module.get<CommentaireController>(CommentaireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
