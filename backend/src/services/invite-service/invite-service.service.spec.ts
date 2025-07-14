import { Test, TestingModule } from '@nestjs/testing';
import { InviteServiceService } from './invite-service.service';

describe('InviteServiceService', () => {
  let service: InviteServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InviteServiceService],
    }).compile();

    service = module.get<InviteServiceService>(InviteServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
