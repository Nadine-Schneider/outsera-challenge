import { plainToInstance, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export const DEFAULT_PORT = 3000;
export const DEFAULT_MOVIELIST_CSV_PATH = 'data/Movielist.csv';

export class EnvironmentVariables {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = DEFAULT_PORT;

  @IsString()
  @IsNotEmpty()
  MOVIELIST_CSV_PATH: string = DEFAULT_MOVIELIST_CSV_PATH;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const variables = plainToInstance(EnvironmentVariables, config, {
    exposeDefaultValues: true,
  });

  const errors = validateSync(variables, {
    skipMissingProperties: false,
    whitelist: true,
    forbidUnknownValues: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map(
        (error) =>
          `  - ${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`,
      )
      .join('\n');

    throw new Error(`Invalid environment variables:\n${details}`);
  }

  return variables;
}
