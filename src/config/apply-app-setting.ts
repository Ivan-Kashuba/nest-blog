import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';

import { ErrorItem } from '../infrastructure/errors/errors';
import { HttpExceptionFilter } from '../infrastructure/exception-filters/http-exception-filter';
import { AppModule } from '../app/app.module';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { UserInfoFromTokenIfExists } from '../infrastructure/middlewares/get-info-from-token-if-exists';

const APP_PREFIX = '';

export const applyAppSettings = (app: INestApplication) => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  // Установка префикса
  setAppPrefix(app);

  setMiddlewares(app);

  // Применение глобальных pipes
  setAppPipes(app);

  // Применение глобальных exceptions filters
  setAppExceptionsFilters(app);
};

const setMiddlewares = (app: INestApplication) => {
  app.use(cookieParser());
};

const setAppPrefix = (app: INestApplication) => {
  // Устанавливается для разворачивания front-end и back-end на одном домене
  // https://site.com - front-end
  // https://site.com/api - backend-end
  app.setGlobalPrefix(APP_PREFIX);
};

const setAppPipes = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const customErrors: ErrorItem[] = [];

        errors.forEach((e) => {
          const constraints = e.constraints || {};

          const constraintKeys = Object.keys(constraints);

          constraintKeys.forEach((cKey) => {
            const msg = constraints[cKey];

            customErrors.push({ field: e.property, message: msg });
          });
        });

        throw new BadRequestException(customErrors);
      },
    }),
  );
};

const setAppExceptionsFilters = (app: INestApplication) => {
  app.useGlobalFilters(new HttpExceptionFilter());
};
