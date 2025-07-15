import { Test, TestingModule } from '@nestjs/testing';
import { QrCodeController } from './qrcode.controller';

describe('QrcodeController', () => {
  let controller: QrCodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrCodeController],
    }).compile();

    controller = module.get<QrCodeController>(QrCodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
