import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './environment-variables';

@Injectable()
export class AppConfigService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  get port(): number {
    return this.configService.get('PORT', { infer: true });
  }

  get movielistCsvPath(): string {
    return this.configService.get('MOVIELIST_CSV_PATH', { infer: true });
  }
}
