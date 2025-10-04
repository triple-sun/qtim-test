import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { LoggerModule } from '../logger/logger.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '../articles/article.entity';
import { CacheModule } from '../cache/cache.module';
import { ArticlesModule } from '../articles/articles.module';
import { ArticlesService } from '../articles/articles.service';

@Module({
  imports: [
    CacheModule,
    ArticlesModule,
    TypeOrmModule.forFeature([UserEntity, ArticleEntity]),
    LoggerModule.forFeature({
      name: UsersModule.name,
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService, ArticlesService],
  exports: [UsersService],
})
export class UsersModule {}
