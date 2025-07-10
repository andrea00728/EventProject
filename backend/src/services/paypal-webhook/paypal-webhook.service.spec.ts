import { Test, TestingModule } from '@nestjs/testing';
import { PaypalWebhookService } from './paypal-webhook.service';

describe('PaypalWebhookService', () => {
  let service: PaypalWebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaypalWebhookService],
    }).compile();

    service = module.get<PaypalWebhookService>(PaypalWebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
