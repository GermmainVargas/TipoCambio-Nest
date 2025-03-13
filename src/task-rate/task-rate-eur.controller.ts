import { Controller, Get } from '@nestjs/common';
import { ExchangeRateService } from './task-rate-eur.service';

@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get('tipo-de-cambio')
  async obtenerTipoDeCambioActual() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.exchangeRateService.obtenerTipoDeCambioActual();
  }
}
