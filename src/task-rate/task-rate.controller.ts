/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { TaskRateService } from './task-rate.service';

@Controller('task-rate')
export class TaskRateController {
    constructor (private readonly taskRateService: TaskRateService) {}
    @Get('tipo-de-cambio')
    async obtenerTipoDeCambio(){
        return await this.taskRateService.obtenerTipoDeCambio();
    }
}
