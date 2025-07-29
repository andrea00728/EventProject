import { Test, TestingModule } from '@nestjs/testing';
import { CommentaireService } from './commentaire.service';

describe('CommentaireService', () => {
  let service: CommentaireService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentaireService],
    }).compile();

    service = module.get<CommentaireService>(CommentaireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
