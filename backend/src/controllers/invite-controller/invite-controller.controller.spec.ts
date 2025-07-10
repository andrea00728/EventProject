import { Test, TestingModule } from '@nestjs/testing';
import { InviteControllerController } from './invite-controller.controller';

describe('InviteControllerController', () => {
  let controller: InviteControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InviteControllerController],
    }).compile();

    controller = module.get<InviteControllerController>(InviteControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
