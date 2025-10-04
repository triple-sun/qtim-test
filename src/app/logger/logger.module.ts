import { DynamicModule, Module, Provider, ValueProvider } from '@nestjs/common';

import { LOGGER_SERVICE_OPTIONS } from './logger.const';
import {
  LoggerServiceAsyncOptions,
  LoggerServiceOptions,
} from './logger.interfaces';
import { LoggerService } from './logger.service';
import { LoggerCoreModule } from './logger-core.module';

@Module({})
export class LoggerModule {
  public static forRoot(options: LoggerServiceOptions): DynamicModule {
    return {
      module: LoggerModule,
      imports: [
        /** Modules **/
        LoggerCoreModule.forRoot(options!),
      ],
    };
  }

  public static forRootAsync(
    options: LoggerServiceAsyncOptions,
  ): DynamicModule {
    return {
      module: LoggerModule,
      imports: [
        /** Modules **/
        LoggerCoreModule.forRootAsync(options),
      ],
    };
  }

  static forFeature(options: LoggerServiceOptions): DynamicModule {
    const LoopModuleOptionsProvider: ValueProvider<LoggerServiceOptions> = {
      provide: LOGGER_SERVICE_OPTIONS,
      useValue: options,
    };

    return {
      module: LoggerModule,
      imports: [],
      providers: [LoopModuleOptionsProvider, LoggerService],
      exports: [LoopModuleOptionsProvider, LoggerService],
    };
  }

  static forFeatureAsync(options: LoggerServiceAsyncOptions): DynamicModule {
    const providers: Provider[] =
      LoggerCoreModule.createAsyncProviders(options);

    return {
      module: LoggerModule,
      providers: [
        /** Providers **/
        ...providers,
        /** Services **/
        LoggerService,
        /** Extra providers **/
        ...(options.extraProviders || []),
      ],
      imports: options.imports,
      exports: [
        ...providers,
        /** Services **/
        LoggerService,
      ],
    };
  }
}
