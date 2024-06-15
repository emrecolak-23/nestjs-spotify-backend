import { Injectable } from '@nestjs/common';

@Injectable()
export class DevConfigService {
  DB_HOST: string = 'localhost';
  getDBHost(): string {
    return this.DB_HOST;
  }
}
