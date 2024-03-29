import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { envConfig } from './config/env-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  await app.listen(envConfig.PORT);
}
bootstrap();
