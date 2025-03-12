import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import {HttpModule} from "@nestjs/axios";


@Module({
  imports: [HttpModule],
  providers: [ExchangeRateService],
})
export class ExchangeRateModule {}
