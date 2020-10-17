import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeService } from './exchange.service';
import { BadRequestException } from '@nestjs/common';
import { CurrenciesService } from '../currencies/currencies.service';
import { ExchangeInputType } from './types/Exchange-input.type';

describe('ExchangeService', () => {
  let service: ExchangeService;
  let currenciesService: CurrenciesService;
  let mockData;

  beforeEach(async () => {
    const currenciesServiceMock = {
      getCurrency: jest.fn().mockReturnValue({ value: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        {
          provide: CurrenciesService,
          useFactory: () => currenciesServiceMock,
        },
      ],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
    currenciesService = module.get<CurrenciesService>(CurrenciesService);

    mockData = {
      from: 'USD',
      to: 'BRL',
      amount: 1,
    } as ExchangeInputType;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convertAmount()', () => {
    it('should be throw if called with invalid parameters', async () => {
      mockData.from = '';
      await expect(service.convertAmount(mockData)).rejects.toThrow(
        new BadRequestException(),
      );

      mockData.from = 'USD';
      mockData.to = 'USD';
      mockData.amount = 0;
      await expect(service.convertAmount(mockData)).rejects.toThrow(
        new BadRequestException(),
      );
    });

    it('should be not throw if called with valid parameters', async () => {
      await expect(service.convertAmount(mockData)).resolves.not.toThrow();
    });

    it('should be called getCurrency twice', async () => {
      await service.convertAmount(mockData);
      await expect(currenciesService.getCurrency).toBeCalledTimes(2);
    });

    it('should be called getCurrency with correct params', async () => {
      await service.convertAmount(mockData);
      await expect(currenciesService.getCurrency).toBeCalledWith('BRL');
      await expect(currenciesService.getCurrency).toHaveBeenCalledWith('USD');
    });

    it('should be throw when getCurrency throw', async () => {
      (currenciesService.getCurrency as jest.Mock).mockRejectedValue(
        new Error(),
      );
      await expect(
        service.convertAmount({
          from: 'INVALID',
          to: 'BRL',
          amount: 1,
        }),
      ).rejects.toThrow();
    });

    it('should be return conversion value', async () => {
      (currenciesService.getCurrency as jest.Mock).mockResolvedValueOnce({
        value: 1,
      });

      (currenciesService.getCurrency as jest.Mock).mockResolvedValueOnce({
        value: 0.2,
      });

      expect(await service.convertAmount(mockData)).toEqual({ amount: 5 });

      (currenciesService.getCurrency as jest.Mock).mockResolvedValueOnce({
        value: 0.2,
      });

      (currenciesService.getCurrency as jest.Mock).mockResolvedValueOnce({
        value: 1,
      });

      expect(await service.convertAmount(mockData)).toEqual({ amount: 0.2 });
    });
  });
});
