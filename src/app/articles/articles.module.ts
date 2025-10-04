import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoggerModule } from '../logger/logger.module';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ArticleEntity } from './article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    CacheModule,
    TypeOrmModule.forFeature([ArticleEntity]),
    LoggerModule.forFeature({
      name: ArticlesModule.name,
    }),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, JwtService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
