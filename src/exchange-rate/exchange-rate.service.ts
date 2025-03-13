import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';


@Injectable()
export class ExchangeRateService {
    
    private token: string | null = null;
    private readonly API_URL = "https://20.188.75.138:50000/b1s/v1";
    private readonly AZA_URL = "http://localhost:3000";

    constructor(private readonly httpService: HttpService) {}

    private getCredentials(company: string) {
        const credentials = {
          SBO_Pruebas: { CompanyDB: 'SBO_Pruebas', UserName: 'erp', Password: 'Wiin2012' },
        };
        return credentials[company] || null;
      }
    
     private async login(company: string) {
        const credentials = this.getCredentials(company);
    
        if (!credentials) {
          throw new HttpException('Empresa no válida', HttpStatus.BAD_REQUEST);
        }
    
        try {
          const { data } = await firstValueFrom(
            this.httpService.post(`${this.API_URL}/Login`, credentials, {
              httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            }),
          );
          return data;
        } catch (error) {
          throw new HttpException(
            error.response?.data || 'Error en login',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    
    private async autoLogin(company = 'SBO_Pruebas'): Promise<void> {
        try {
          const data = await this.login(company);
          if (!data?.SessionId) {
            throw new HttpException('Error en inicio de sesión', HttpStatus.UNAUTHORIZED);
          }
          console.log('Sesión iniciada con éxito, Token:', this.token);
          return data.SessionId;
        } catch (error) {
          console.error('Error en inicio de sesión automático:', error.message);
          throw new HttpException('Error en inicio de sesión', HttpStatus.UNAUTHORIZED);
        }
      }

    private async getExchangeRate(): Promise<number> {
        try {
          const response = await this.httpService.get(`${this.AZA_URL}/task-rate/tipo-de-cambio`).toPromise();
          return response?.data.tipo_de_cambio;
        } catch (error) {
          throw new HttpException('Error obteniendo tipo de cambio', HttpStatus.BAD_REQUEST);
        }
      }

    private async getExchangeRateEUR(): Promise<number> {
        try {
            const response = await this.httpService.get(`${this.AZA_URL}/exchange-rate/tipo-de-cambio`).toPromise();
            return response?.data.tipo_de_cambio;
        } catch (error) {
            throw new HttpException('Error obteniendo tipo de cambio EUR', HttpStatus.BAD_REQUEST);
        }
      }

    private getTodayDate(): string {
        const today = new Date();
        
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0 (enero = 0)
        const day = String(today.getDate()).padStart(2, '0');
      
        return `${year}${month}${day}`;
      }
    
    private async updateExchangeRates(): Promise<string> {
        // console.log({toker: this.token});
        // if (!this.token) {
        //     await this.autoLogin();
        // }

        // TODO: MOdificar la forma de obtener el token

        const token = await this.autoLogin();

        // console.log({token})

        const exchangeRates = [
            { Currency: 'USD', Rate: await this.getExchangeRate() },
            { Currency: 'EUR', Rate: await this.getExchangeRateEUR() },
        ];
        
        const today = this.getTodayDate();

        try {
            for (const { Currency, Rate } of exchangeRates) {
            const response = await this.httpService.post(`${this.API_URL}/SBOBobService_SetCurrencyRate`, {
                Currency,
                Rate,
                RateDate: today,
            }, {
                headers: { Cookie: `B1SESSION=${token}` },
                
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            }).toPromise();
    
            if (response?.status === 401) {
                await this.autoLogin();
                return this.updateExchangeRates();
            }
            }
            return 'Tipo de cambio actualizado exitosamente';
        } catch (error) {
            console.log(error.message);
            throw new HttpException('Error en la actualización del tipo de cambio', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Cron('* * * * *')
  async handleCron() {
    console.log('Ejecutando cron job para actualizar tipo de cambio...');
    try {
      const message = await this.updateExchangeRates();
      console.log(message);
    } catch (error) {
      console.error('Error ejecutando el cron job:', error.message);
    }
  }
}
