import { Test, TestingModule } from '@nestjs/testing';
import { ForfaitService } from './forfait.service';

describe('ForfaitService', () => {
  let service: ForfaitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForfaitService],
    }).compile();

    service = module.get<ForfaitService>(ForfaitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
