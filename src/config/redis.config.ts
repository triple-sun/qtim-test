import 'dotenv/config';
import KeyvRedis from '@keyv/redis';
import { registerAs } from '@nestjs/config';
import { IsInt, IsString } from 'class-validator';

export class RedisEnv {
  @IsString()
  REDIS_HOST: string;
  @IsInt()
  REDIS_PORT: number;
}

export const redisOptions = registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
}));

export const redisConfig = {
  isGlobal: true,
  stores: [
    new KeyvRedis(
      `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    ),
  ],
};
