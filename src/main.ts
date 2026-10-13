import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createApp } from './app.factory';
import type { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await createApp();

  app.enableShutdownHooks();

  const configService = app.get(ConfigService<AppConfig, true>);
  const port = configService.get('port', { infer: true });
  await app.listen(port);

  Logger.log(`Application listening on port ${port}`, 'Bootstrap');
  Logger.log(`Swagger docs available at /api/docs`, 'Bootstrap');
}

void bootstrap();
