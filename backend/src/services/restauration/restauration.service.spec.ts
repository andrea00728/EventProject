import { Test, TestingModule } from '@nestjs/testing';
import { RestaurationService } from './restauration.service';

describe('RestaurationService', () => {
  let service: RestaurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestaurationService],
    }).compile();

    service = module.get<RestaurationService>(RestaurationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
