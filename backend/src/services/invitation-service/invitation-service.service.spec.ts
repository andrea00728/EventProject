import { Test, TestingModule } from '@nestjs/testing';
import { InvitationServiceService } from './invitation-service.service';

describe('InvitationServiceService', () => {
  let service: InvitationServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvitationServiceService],
    }).compile();

    service = module.get<InvitationServiceService>(InvitationServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
