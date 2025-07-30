import { Test, TestingModule } from '@nestjs/testing';
import { SatisfactionService } from './satisfaction.service';

describe('SatisfactionService', () => {
  let service: SatisfactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SatisfactionService],
    }).compile();

    service = module.get<SatisfactionService>(SatisfactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
