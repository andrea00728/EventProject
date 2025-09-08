import { Test, TestingModule } from '@nestjs/testing';
import { PaiementService } from './paiement.service';

describe('PaiementService', () => {
  let service: PaiementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaiementService],
    }).compile();

    service = module.get<PaiementService>(PaiementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
