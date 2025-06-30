import { Test, TestingModule } from '@nestjs/testing';
import { CommandeController } from './commande.controller';

describe('CommandeController', () => {
  let controller: CommandeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommandeController],
    }).compile();

    controller = module.get<CommandeController>(CommandeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
