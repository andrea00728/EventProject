import { Test, TestingModule } from '@nestjs/testing';
import { PaiementController } from './paiement.controller';

describe('PaiementController', () => {
  let controller: PaiementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaiementController],
    }).compile();

    controller = module.get<PaiementController>(PaiementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
