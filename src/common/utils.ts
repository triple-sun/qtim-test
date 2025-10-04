import { InternalServerErrorException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

/**
 * Обработка ошибок валидации
 *
 * @param errors результат метода validateSync class-validator
 * @returns
 */
export const handleValidationErrors = (errors: ValidationError[]) =>
  errors.forEach((e) => {
    throw new InternalServerErrorException(
      `${e.constraints?.['customValidation'] ?? e.toString()}`,
    );
  });
