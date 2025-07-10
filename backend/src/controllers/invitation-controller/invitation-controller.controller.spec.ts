import { Test, TestingModule } from '@nestjs/testing';
import { InvitationControllerController } from './invitation-controller.controller';

describe('InvitationControllerController', () => {
  let controller: InvitationControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationControllerController],
    }).compile();

    controller = module.get<InvitationControllerController>(InvitationControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
