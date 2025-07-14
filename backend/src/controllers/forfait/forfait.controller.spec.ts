import { Test, TestingModule } from '@nestjs/testing';
import { ForfaitController } from './forfait.controller';

describe('ForfaitController', () => {
  let controller: ForfaitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForfaitController],
    }).compile();

    controller = module.get<ForfaitController>(ForfaitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
