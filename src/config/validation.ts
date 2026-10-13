import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(0)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN: string = '*';

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string = '15m';

  @IsInt()
  @Min(1000)
  THROTTLE_TTL: number = 60000;

  @IsInt()
  @Min(1)
  THROTTLE_LIMIT: number = 20;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  BLOB_READ_WRITE_TOKEN?: string;
}

/**
 * Validates process.env against EnvironmentVariables at bootstrap time.
 * Throws (and crashes startup) if required variables are missing or malformed,
 * satisfying the "fail fast on invalid config" requirement.
 */
export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Environment variable validation failed: ${messages}`);
  }

  return validatedConfig;
}
