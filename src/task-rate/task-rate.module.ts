import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TaskRateService } from './task-rate.service';
import { TaskRateController } from './task-rate.controller';
import { ExchangeRateService } from './task-rate-eur.service';
import { ExchangeRateController } from './task-rate-eur.controller';

@Module({
  imports: [HttpModule],
  providers: [TaskRateService, ExchangeRateService],
  controllers: [TaskRateController, ExchangeRateController],
})
export class TaskRateModule {}
