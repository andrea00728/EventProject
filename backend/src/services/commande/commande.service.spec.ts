import { Test, TestingModule } from '@nestjs/testing';
import { CommandeService } from './commande.service';

describe('CommandeService', () => {
  let service: CommandeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommandeService],
    }).compile();

    service = module.get<CommandeService>(CommandeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
