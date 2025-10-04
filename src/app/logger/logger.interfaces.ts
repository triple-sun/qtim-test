import { ModuleMetadata, Provider, Type } from '@nestjs/common';

export interface LoggerServiceOptions {
  name?: string;
  timestamp?: boolean;
}

export interface LoggerServiceFeatureOptions extends LoggerServiceOptions {
  name: Required<string>;
}

export interface LoggerServiceOptionsFactory {
  createLoopOptions(): Promise<LoggerServiceOptions> | LoggerServiceOptions;
}

export interface LoggerServiceAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<LoggerServiceOptionsFactory>;
  useExisting?: Type<LoggerServiceOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<LoggerServiceOptions> | LoggerServiceOptions;
  extraProviders?: Provider[];
}
