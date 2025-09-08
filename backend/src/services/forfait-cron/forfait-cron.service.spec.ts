import { Test, TestingModule } from '@nestjs/testing';
import { ForfaitCronService } from './forfait-cron.service';

describe('ForfaitCronService', () => {
  let service: ForfaitCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForfaitCronService],
    }).compile();

    service = module.get<ForfaitCronService>(ForfaitCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
