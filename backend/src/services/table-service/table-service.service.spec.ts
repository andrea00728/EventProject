import { Test, TestingModule } from '@nestjs/testing';
import { TableServiceService } from './table-service.service';

describe('TableServiceService', () => {
  let service: TableServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TableServiceService],
    }).compile();

    service = module.get<TableServiceService>(TableServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
