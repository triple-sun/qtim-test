import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { UserEmailCacheKey } from './users.utils';
import { ALL_USERS_CACHE_KEY } from '../logger/users.const';
import { ALL_ARTICLES_CACHE_KEY } from '../articles/articles.const';
import { ArticleIdCacheKey } from '../articles/articles.utils';
import { CacheService } from '../cache/cache.service';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly cache: CacheService,
    private readonly articlesService: ArticlesService,

    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async signUp({ email, password }: CreateUserDto) {
    const newUser = this.usersRepository.create({ email });

    await newUser.setPassword(password);

    const saved = await this.usersRepository.save(newUser);

    /** Обновляем кеш */ await this.updateItemCache(saved);

    return saved;
  }

  async updateByEmail(email: string, { password }: UpdateUserDto) {
    const toUpdate = await this.usersRepository.findOneBy({ email });

    await toUpdate.setPassword(password);

    const updated = await this.usersRepository.save(toUpdate);

    /** Обновляем кеш */ await this.updateItemCache(updated);

    return updated;
  }

  async deleteByEmail(email: string) {
    /** Получаем список статей для чистки кеша */
    const articles = await this.articlesService.findByEmail(email);
    /** Удаляем юзера */
    await this.usersRepository.delete({ email });
    /** Чистим кеш юзеров */
    await this.cache.delete(ALL_USERS_CACHE_KEY);
    await this.cache.delete(UserEmailCacheKey(email));
    /** Чистим кеш статей юзера */
    await this.cache.delete(ALL_ARTICLES_CACHE_KEY);
    await this.cache.deleteMany(
      articles.map(({ id }) => ArticleIdCacheKey(id)),
    );

    return { deleted: true };
  }

  /** Обновление кеша */
  async updateItemCache(item: UserEntity) {
    await this.cache.set(UserEmailCacheKey(item.email), item);
    await this.cache.delete(ALL_USERS_CACHE_KEY);
  }
}
