import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';

@Injectable()
export class TaskRateService {
  private readonly API_URL =
    'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos';
  private readonly token =
    'bd753cf2dc6bf3c5e05b703fe31e8c7863f72dee60168eb6b9e18bf9c3ff96df';

  constructor(private readonly httpService: HttpService) {}

  async obtenerTipoDeCambio() {
    let fechaActual = moment();

    // Si es sábado o domingo, retroceder al viernes más reciente
    if (fechaActual.isoWeekday() === 6) {
      // Sábado
      fechaActual = fechaActual.subtract(1, 'day');
    } else if (fechaActual.isoWeekday() === 7) {
      // Domingo
      fechaActual = fechaActual.subtract(2, 'days');
    }

    // Validar si hay datos en la fecha actual, si no, retroceder hasta encontrar datos
    while (!(await this.existeTipoDeCambio(fechaActual))) {
      fechaActual = fechaActual.subtract(1, 'day'); // Retroceder un día hasta encontrar datos
    }

    const fechaFormatted = fechaActual.format('YYYY-MM-DD');
    const url = `${this.API_URL}/${fechaFormatted}/${fechaFormatted}`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: { 'Bmx-Token': this.token },
        }),
      );

      const tipoDeCambio = data?.bmx?.series?.[0]?.datos?.[0];

      if (tipoDeCambio) {
        return {
          fecha: tipoDeCambio.fecha,
          tipo_de_cambio: tipoDeCambio.dato,
        };
      }
      throw new HttpException(
        'No se encontraron datos para la fecha solicitada.',
        HttpStatus.NOT_FOUND,
      );
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Error al obtener el tipo de cambio',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async existeTipoDeCambio(fecha: moment.Moment): Promise<boolean> {
    const fechaFormatted = fecha.format('YYYY-MM-DD');
    const url = `${this.API_URL}/${fechaFormatted}/${fechaFormatted}`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: { 'Bmx-Token': this.token },
        }),
      );

      return !!data?.bmx?.series?.[0]?.datos?.length;
    } catch {
      return false;
    }
  }
}
