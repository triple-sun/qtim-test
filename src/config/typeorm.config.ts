import 'dotenv/config';

import { IsInt, IsString } from 'class-validator';
import { ConfigService, registerAs } from '@nestjs/config';
import { DataSource } from 'typeorm';

export class DatabaseEnv {
  @IsString()
  DB_USER: string;
  @IsString()
  DB_PASS: string;
  @IsString()
  DB_HOST: string;
  @IsInt()
  DB_PORT: number;
  @IsString()
  DB_NAME: string;
}

export const typeOrmOptions = registerAs('typeorm', () => ({
  host: `${process.env.DB_HOST}`,
  port: +process.env.DB_PORT,
  username: `${process.env.DB_USER}`,
  password: `${process.env.DB_PASS}`,
  database: `${process.env.DB_NAME}`,
}));

const config = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: config.get<string>('typeorm.host'),
  port: config.get<number>('typeorm.port'),
  username: config.get<string>('typeorm.username'),
  password: config.get<string>('typeorm.password'),
  database: config.get<string>('typeorm.database'),
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*.ts'],
});
