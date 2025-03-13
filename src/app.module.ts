import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';
import { TaskRateModule } from './task-rate/task-rate.module';




@Module({
  imports: [
    ScheduleModule.forRoot(), // Habilita el módulo de cron jobs
    ExchangeRateModule, TaskRateModule,
  ],
})
export class AppModule {}
