import { Test, TestingModule } from '@nestjs/testing';
import { SystemPromptService } from './system-prompt.service';

describe('SystemPromptService', () => {
  let service: SystemPromptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemPromptService],
    }).compile();

    service = module.get<SystemPromptService>(SystemPromptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
