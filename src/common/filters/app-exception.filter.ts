import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { LoggerService } from 'src/app/logger/logger.service';

/** Обработка ошибок с отправкой ответов в планфикс с ошибкой в ключе comment */
@Injectable()
@Catch()
export class AppExceptionsFilter extends BaseExceptionFilter {
  constructor(
    readonly logger: LoggerService,
    readonly httpAdapterHost: HttpAdapterHost,
  ) {
    super();
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    // На всякий случай
    const { httpAdapter } = this.httpAdapterHost;

    const response =
      'getResponse' in exception ? exception.getResponse() : exception;

    const errErr = response['error'];
    const errMsg = response['message'] ? response['message'] : response;

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errText = `[${httpStatus}]${errErr ? `[${errErr}]` : ''}: ${errMsg}`;

    this.logger.error(errText);

    const responseBody = {
      message: errText,
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
