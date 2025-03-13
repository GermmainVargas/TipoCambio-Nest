import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as xml2js from 'xml2js';
import * as moment from 'moment';

@Injectable()
export class ExchangeRateService {
  private readonly ECB_API_URL = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';

  constructor(private readonly httpService: HttpService) {}

  async obtenerTipoDeCambioActual() {
    try {
      const response = await firstValueFrom(this.httpService.get(this.ECB_API_URL));
      const xmlData = response.data;

      // Convertir XML a JSON
      const parsedData = await xml2js.parseStringPromise(xmlData);
      
      // Extraer los datos del tipo de cambio
      const cube = parsedData['gesmes:Envelope'].Cube[0].Cube[0].Cube;

      let tipoDeCambio = null;
      for (const rate of cube) {
        if (rate.$.currency === 'MXN') {
          tipoDeCambio = rate.$.rate;
          break;
        }
      }

      if (tipoDeCambio) {
        return {
          fecha: moment().format('YYYY-MM-DD'),
          tipo_de_cambio: parseFloat(tipoDeCambio),
        };
      } else {
        throw new HttpException('No se encontraron datos para MXN.', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException('Error al consultar la API del BCE.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
