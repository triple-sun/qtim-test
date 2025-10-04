import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

export const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  validateCustomDecorators: true,
  skipMissingProperties: false,
  transformOptions: {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
    exposeUnsetFields: true,
  },
  enableDebugMessages: true,
};

export const globalValidationPipe = new ValidationPipe(validationPipeOptions);
