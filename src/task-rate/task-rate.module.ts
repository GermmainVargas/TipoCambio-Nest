import { Module } from '@nestjs/common';
import { TaskRateService } from './task-rate.service';


@Module({
  providers: [TaskRateService]
})
export class TaskRateModule {}
