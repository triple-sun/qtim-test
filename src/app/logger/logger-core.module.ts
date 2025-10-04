import {
  DynamicModule,
  Global,
  Module,
  Provider,
  ValueProvider,
} from '@nestjs/common';

import { LOGGER_SERVICE_OPTIONS } from './logger.const';
import {
  LoggerServiceAsyncOptions,
  LoggerServiceOptions,
  LoggerServiceOptionsFactory,
} from './logger.interfaces';
import { LoggerService } from './logger.service';

@Global()
@Module({})
export class LoggerCoreModule {
  /** */
  public static forRoot(options: LoggerServiceOptions): DynamicModule {
    const LoopModuleOptionsProvider: ValueProvider<LoggerServiceOptions> = {
      provide: LOGGER_SERVICE_OPTIONS,
      useValue: options,
    };

    return {
      module: LoggerCoreModule,
      providers: [LoopModuleOptionsProvider, LoggerService],
      exports: [LoggerService],
    };
  }

  public static forRootAsync(
    options: LoggerServiceAsyncOptions,
  ): DynamicModule {
    const providers: Provider[] = this.createAsyncProviders(options);

    return {
      module: LoggerCoreModule,
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
        /** Services **/
        LoggerService,
      ],
    };
  }

  public static createAsyncProviders(
    options: LoggerServiceAsyncOptions,
  ): Provider[] {
    const providers: Provider[] = [this.createAsyncOptionsProvider(options)];

    if (options.useClass) {
      providers.push({
        provide: options.useClass,
        useClass: options.useClass,
      });
    }

    return providers;
  }

  private static createAsyncOptionsProvider(
    options: LoggerServiceAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        name: LOGGER_SERVICE_OPTIONS,
        provide: LOGGER_SERVICE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      name: LOGGER_SERVICE_OPTIONS,
      provide: LOGGER_SERVICE_OPTIONS,
      useFactory: async (optionsFactory: LoggerServiceOptionsFactory) => {
        return optionsFactory.createLoopOptions();
      },
      inject: [options.useExisting! || options.useClass!],
    };
  }
}
