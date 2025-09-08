import { Test, TestingModule } from '@nestjs/testing';
import { SatisfactionController } from './satisfaction.controller';

describe('SatisfactionController', () => {
  let controller: SatisfactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SatisfactionController],
    }).compile();

    controller = module.get<SatisfactionController>(SatisfactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
