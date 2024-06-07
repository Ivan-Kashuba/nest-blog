import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

import { applyAppSettings } from './config/apply-app-setting';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from './config/env-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const PORT = configService.get<string>(EnvVariables.PORT);

  app.enableCors();
  applyAppSettings(app);

  await app.listen(PORT!);
}
bootstrap();
