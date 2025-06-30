import { Test, TestingModule } from '@nestjs/testing';
import { RestaurationController } from './restauration.controller';

describe('RestaurationController', () => {
  let controller: RestaurationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurationController],
    }).compile();

    controller = module.get<RestaurationController>(RestaurationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
