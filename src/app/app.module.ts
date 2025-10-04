import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseEnv, typeOrmOptions } from 'src/config/typeorm.config';
import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import { AuthEnv, authOptions } from 'src/config/auth.config';
import { plainToInstance } from 'class-transformer';
import { IntersectionType } from '@nestjs/swagger';
import { AppEnv } from 'src/config/app.config';
import { validateSync } from 'class-validator';
import { handleValidationErrors } from 'src/common/utils';
import { ClsModule } from 'nestjs-cls';
import { nanoid } from 'nanoid';
import { RequestLoggerMiddleware } from 'src/common/middleware/request-logger.middleware';
import { LoggerModule } from './logger/logger.module';
import { ArticlesModule } from './articles/articles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DataSource } from 'typeorm';
import { redisOptions } from 'src/config/redis.config';

@Module({
  imports: [
    AuthModule,
    ArticlesModule,
    UsersModule,
    /** Настраиваемые модули */
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('typeorm.host'),
        port: config.get<number>('typeorm.port'),
        username: config.get<string>('typeorm.username'),
        password: config.get<string>('typeorm.password'),
        database: config.get<string>('typeorm.database'),
        migrations: ['src/db/migrations/*{.ts,.js}'],
        entities: [__dirname + '/../!(node_modules)**/*.entity.{js,ts}'],
        migrationsTableName: 'migrations',
        migrationsRun: false,
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    LoggerModule.forFeatureAsync({
      useFactory: () => ({
        name: 'RequestLogger',
      }),
    }),
    ClsModule.forRoot({
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => req.headers['X-Request-Id'] ?? nanoid(),
      },
      global: true,
    }),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      expandVariables: true,
      load: [
        registerAs('app', () => ({
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT,
        })),
        authOptions,
        redisOptions,
        typeOrmOptions,
      ],
      validate: (config: Record<string, unknown>) => {
        const cfg = plainToInstance(
          IntersectionType(AppEnv, AuthEnv, DatabaseEnv),
          config,
          {
            enableImplicitConversion: true,
          },
        ) as object;

        const errors = validateSync(cfg, { skipMissingProperties: false });

        if (errors.length > 0) {
          handleValidationErrors(errors);
        }

        return cfg;
      },
    }),
  ],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
  /** Глобальный логгер запросов */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
