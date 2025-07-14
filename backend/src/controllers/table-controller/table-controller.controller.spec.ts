import { Test, TestingModule } from '@nestjs/testing';
import { TableControllerController } from './table-controller.controller';

describe('TableControllerController', () => {
  let controller: TableControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableControllerController],
    }).compile();

    controller = module.get<TableControllerController>(TableControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
