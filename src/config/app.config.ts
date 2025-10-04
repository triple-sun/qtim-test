import { registerAs } from '@nestjs/config';
import { IsInt, IsString } from 'class-validator';

export class AppEnv {
  @IsInt()
  PORT: number;
  @IsString()
  NODE_ENV: string;
}

export const appOptions = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
}));
