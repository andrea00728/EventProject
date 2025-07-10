import { Test, TestingModule } from '@nestjs/testing';
import { LocalisationServiceService } from './localisation-service.service';

describe('LocalisationServiceService', () => {
  let service: LocalisationServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalisationServiceService],
    }).compile();

    service = module.get<LocalisationServiceService>(LocalisationServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
