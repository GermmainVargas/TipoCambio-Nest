import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';




@Module({
  imports: [
    ScheduleModule.forRoot(), // Habilita el módulo de cron jobs
    ExchangeRateModule,
  ],
})
export class AppModule {}
