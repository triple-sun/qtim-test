import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { redisConfig } from '../../config/redis.config';

@Module({
  imports: [NestCacheModule.register(redisConfig)],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
