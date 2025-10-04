import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: `Некоррейтный имейл!` })
  @ApiProperty({ type: String, description: 'Email пользователя' })
  email: string;
  @IsString({ message: `Некорректный пароль!` })
  @ApiProperty({ type: String, description: 'Пароль пользователя' })
  password: string;
}

export class UpdateUserDto {
  @IsString()
  password?: string;
}

export class UserEmailParamDto {
  @IsEmail({}, { message: `Некоррейтный имейл!` })
  @ApiProperty({ type: String, description: 'Email пользователя' })
  email: string;
}

export class QueryUsersDto {
  @IsEmail({}, { message: `Некоррейтный имейл!` })
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Email пользователя',
    required: false,
  })
  email?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Дата создания пользователя',
    required: false,
  })
  createdAt?: Date;

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Дата обновления пользователя',
    required: false,
  })
  updatedAt?: Date;

  @IsInt()
  @IsOptional()
  take?: number;

  @IsInt()
  @IsOptional()
  page?: number;
}
