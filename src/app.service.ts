import { Inject, Injectable } from '@nestjs/common';
import { DevConfigService } from './common/providers/dev-config.service';

@Injectable()
export class AppService {
  constructor(
    private readonly devConfigService: DevConfigService,
    @Inject('CONFIG') private config: { port: number; host: string },
  ) {}
  getHello(): string {
    return `The database host is ${this.devConfigService.getDBHost()} and the port is ${this.config.port}!`;
  }
}
