import { Injectable, NotFoundException } from '@nestjs/common';

import { IAuthUser } from '../auth/auth.interfaces';
import {
  CreateArticleDto,
  QueryArticlesDto,
  UpdateArticleDto,
} from './articles.dto';
import { ArticleEntity } from './article.entity';
import { Between, FindOptionsWhere, Like, Repository } from 'typeorm';
import { ArticleIdCacheKey } from './articles.utils';
import { ALL_ARTICLES_CACHE_KEY } from './articles.const';
import dayjs from 'dayjs';
import { CacheService } from '../cache/cache.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly cache: CacheService,

    @InjectRepository(ArticleEntity)
    private articlesRepository: Repository<ArticleEntity>,
  ) {}

  public async findAll() {
    const cached = await this.cache.get<ArticleEntity>(ALL_ARTICLES_CACHE_KEY);

    /** Отдаем кеш если он есть */
    if (cached) return cached;

    const articles = await this.articlesRepository.find({
      relations: ['createdBy'],
    });
    /** Пишем в кеш */
    await this.cache.set(ALL_ARTICLES_CACHE_KEY, articles);

    return articles;
  }

  async findMany({
    id,
    title,
    text,
    take,
    page,
    createdAt,
    createdByEmail,
  }: QueryArticlesDto) {
    const where: FindOptionsWhere<ArticleEntity> = {
      id,
    };

    if (title) where.title = Like(`%${title}%`);
    if (text) where.text = Like(`%${text}%`);
    if (createdByEmail) where.createdBy = { email: createdByEmail };
    if (createdAt) {
      where.createdAt = Between(
        dayjs(createdAt, 'DD.MM.YYYY').toDate(),
        dayjs(createdAt, 'DD.MM.YYYY').add(1, 'day').toDate(),
      );
    }

    const articles = await this.articlesRepository.find({
      where,
      take,
      skip: page && take ? take * page : undefined,
    });

    return articles;
  }

  async findById(id: number) {
    const cached = await this.cache.get<ArticleEntity>(ArticleIdCacheKey(id));

    if (cached) return cached;

    const found = await this.articlesRepository.findOneBy({ id });

    await this.cache.set(ArticleIdCacheKey(id), found);

    return found;
  }

  async findByUserEmail(email: string) {
    return await this.articlesRepository.findBy({
      createdBy: { email: email },
    });
  }

  async create(dto: CreateArticleDto, user: IAuthUser) {
    const newArticle = this.articlesRepository.create({
      ...dto,
      createdBy: { email: user.email },
    });

    const saved = await this.articlesRepository.save(newArticle);

    /** Обновляем кеш */ await this.updateItemCache(saved);

    return saved;
  }

  async update(id: number, dto: UpdateArticleDto) {
    const toUpdate = await this.articlesRepository.findOneBy({ id });

    const updated = Object.assign(toUpdate, dto);

    const saved = await this.articlesRepository.save(updated);

    /** Обновляем кеш */ await this.updateItemCache(saved);

    return saved;
  }

  async delete(id: number) {
    await this.articlesRepository.delete({ id });
    /** Чистим кеш */
    await this.cache.delete(ArticleIdCacheKey(id));
    await this.cache.delete(ALL_ARTICLES_CACHE_KEY);

    return { deleted: true };
  }

  /** Обновление кеша */
  async updateItemCache(item: ArticleEntity) {
    await this.cache.set(ArticleIdCacheKey(item.id), item);
    await this.cache.delete(ALL_ARTICLES_CACHE_KEY);
  }
}
