import { Injectable, InternalServerErrorException } from '@nestjs/common';

export class CurrenciesRepository {
  async getCurrency(currency: string): Promise<any> {
    throw new InternalServerErrorException();
  }
}

@Injectable()
export class CurrenciesService {
  constructor(private currenciesRepository: CurrenciesRepository) {}

  async getCurrency(currency: string): Promise<any> {
    try {
      await this.currenciesRepository.getCurrency(currency);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
