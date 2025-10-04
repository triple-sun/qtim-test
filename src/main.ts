import 'reflect-metadata';
import 'dotenv/config';
import 'source-map-support/register';
import './config/dayjs.config';

import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClsService } from 'nestjs-cls';

import { AppModule } from './app/app.module';
import { LoggerService } from './app/logger/logger.service';
import { AppExceptionsFilter } from './common/filters/app-exception.filter';
import { globalValidationPipe } from './config/validation.config';

async function main(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  /** Конфиг */
  const httpAdapterHost = app.get(HttpAdapterHost);
  const config = app.get(ConfigService);
  const cls = app.get(ClsService);

  const APP_PORT = config.get<number>('app.port');
  const NODE_ENV = config.get<string>('app.nodeEnv');
  /** CORS */
  app.enableCors({
    credentials: true,
    origin: NODE_ENV === 'production' ? '' : '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  /** Валидация всех DTO */
  app.useGlobalPipes(globalValidationPipe);
  /** Глобальный фильтр ошибок */
  app.useGlobalFilters(
    new AppExceptionsFilter(
      new LoggerService({ name: AppExceptionsFilter.name }, cls),
      httpAdapterHost,
    ),
  );
  /** Сериализация сущностей */
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  /** Сваггер */
  SwaggerModule.setup(
    `spec`,
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('qtim-test')
        .setDescription('qtim-test')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    ),
  );

  await app.listen(APP_PORT);

  Logger.log(`🚀 Приложение [qtim-test-app] запущено на порту ${APP_PORT}`);
  Logger.log(`🚀 Интерфейс Swagger доступен по адресу /spec`);
}

main();
