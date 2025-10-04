import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { LOGGER_SERVICE_OPTIONS } from './logger.const';
import { LoggerServiceOptions } from './logger.interfaces';

@Injectable()
export class LoggerService extends Logger {
  private readonly moduleName?: string;

  constructor(
    @Inject(LOGGER_SERVICE_OPTIONS)
    readonly options: LoggerServiceOptions,
    private readonly cls: ClsService,
  ) {
    super();
    this.moduleName = options.name;
  }

  private format(msg: unknown) {
    if (typeof msg === 'string') {
      return msg;
    } else if (typeof msg === 'object' && 'msg' in msg) {
      return [
        'statusCode' in msg && `[${msg.statusCode}]`,
        'error' in msg && `[${msg.error}]`,
        msg.msg,
      ]
        .filter((el) => !!el)
        .join(` `);
    } else return JSON.stringify(msg);
  }

  public log(msg: any, _requestId?: string) {
    return Logger.log(
      `${this.moduleName ? `[${this.moduleName}]` : ``}` +
        `${this.cls?.getId() ? `[${this.cls?.getId()}]` : ''}` +
        `${_requestId ? `[${_requestId}]` : ``}` +
        `: ${this.format(msg)}`,
    );
  }
  public warn(msg: any, _requestId?: string) {
    return Logger.warn(
      `${this.moduleName ? `[${this.moduleName}]` : ``}` +
        `${this.cls?.getId() ? `[${this.cls?.getId()}]` : ''}` +
        `${_requestId ? `[${_requestId}]` : ``}` +
        `: ${this.format(msg)}`,
    );
  }
  public debug(msg: any, _requestId?: string) {
    return Logger.debug(
      `${this.moduleName ? `[${this.moduleName}]` : ``}` +
        `${this.cls?.getId() ? `[${this.cls?.getId()}]` : ''}` +
        `${_requestId ? `[${_requestId}]` : ``}` +
        `: ${this.format(msg)}`,
    );
  }
  public error(msg: any, _requestId?: string) {
    return Logger.error(
      `${this.moduleName ? `[${this.moduleName}]` : ``}` +
        `${this.cls?.getId() ? `[${this.cls?.getId()}]` : ''}` +
        `${_requestId ? `[${_requestId}]` : ``}` +
        `: ${this.format(msg)}`,
    );
  }
  public verbose(msg: any, _requestId?: string) {
    return Logger.verbose(
      `${this.moduleName ? `[${this.moduleName}]` : ``}` +
        `${this.cls?.getId() ? `[${this.cls?.getId()}]` : ''}` +
        `${_requestId ? `[${_requestId}]` : ``}` +
        `: ${this.format(msg)}`,
    );
  }
  public fatal(msg: any, _requestId?: string) {
    return Logger.fatal(
      `${this.moduleName ? `[${this.moduleName}]` : ``}` +
        `${this.cls?.getId() ? `[${this.cls?.getId()}]` : ''}` +
        `${_requestId ? `[${_requestId}]` : ``}` +
        `: ${this.format(msg)}`,
    );
  }
}
