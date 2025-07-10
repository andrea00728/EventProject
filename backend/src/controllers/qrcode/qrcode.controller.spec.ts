import { Test, TestingModule } from '@nestjs/testing';
import { QrcodeController } from './qrcode.controller';

describe('QrcodeController', () => {
  let controller: QrcodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrcodeController],
    }).compile();

    controller = module.get<QrcodeController>(QrcodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
