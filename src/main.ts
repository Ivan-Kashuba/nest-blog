import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { envConfig } from './config/env-config';
import { applyAppSettings } from './config/apply-app-setting';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  applyAppSettings(app);

  await app.listen(envConfig.PORT);
}
bootstrap();
