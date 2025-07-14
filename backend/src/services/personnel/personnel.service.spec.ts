import { Test, TestingModule } from '@nestjs/testing';
import { PersonnelService } from './personnel.service';

describe('PersonnelService', () => {
  let service: PersonnelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonnelService],
    }).compile();

    service = module.get<PersonnelService>(PersonnelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
