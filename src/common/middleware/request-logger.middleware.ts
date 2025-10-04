import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { LoggerService } from 'src/app/logger/logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, _: Response, next: NextFunction) {
    if (!req.headers['X-Request-Id']) req.headers['X-Request-Id'] = nanoid();

    this.logger.verbose(
      `[${req.headers['X-Request-Id']}] Получен запрос: \n${JSON.stringify({
        body: req.body,
        params: req.params,
        query: req.query,
        url: req.url || req.body.url,
        path: req.path,
        baseUrl: req.baseUrl,
      })}`,
    );

    next();
  }
}
