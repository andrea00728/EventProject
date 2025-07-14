import { Test, TestingModule } from '@nestjs/testing';
import { EvenementController } from './evenement.controller';

describe('EvenementController', () => {
  let controller: EvenementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvenementController],
    }).compile();

    controller = module.get<EvenementController>(EvenementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
