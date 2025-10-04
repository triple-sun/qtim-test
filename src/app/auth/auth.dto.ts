import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AuthLoginDto {
  @IsEmail({}, { message: `Некоррейтный имейл!` })
  @ApiProperty({ type: String, description: 'Email пользователя' })
  email: string;
  @IsString({ message: `Некорректный пароль!` })
  @ApiProperty({ type: String, description: 'Пароль пользователя' })
  password: string;
}
