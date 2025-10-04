import 'dotenv/config';

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

import { Repository } from 'typeorm';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CacheService } from '../cache/cache.service';
import { CacheModule } from '../cache/cache.module';
import { ALL_ARTICLES_CACHE_KEY } from '../articles/articles.const';
import { UserCacheKey } from './users.utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockUserEntities, mockUsers } from './users.mocks';
import { UserEntity } from './user.entity';
import { mockArticleEntities } from '../articles/articles.mocks';
import { ArticlesService } from '../articles/articles.service';
import { ArticleIdCacheKey } from '../articles/articles.utils';
import { ALL_USERS_CACHE_KEY } from '../logger/users.const';

describe('UsersService', () => {
  let service: UsersService;
  let cacheService: DeepMockProxy<CacheService>;
  let articlesService: DeepMockProxy<ArticlesService>;
  let usersRepository: DeepMockProxy<Repository<UserEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule],
      providers: [
        CacheService,
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockDeep<Repository<UserEntity>>(),
        },
        {
          provide: ArticlesService,
          useValue: mockDeep<ArticlesService>(),
        },
      ],
    })
      .overrideProvider(CacheService)
      .useValue(mockDeep<CacheService>())
      .compile();

    service = module.get(UsersService);
    cacheService = module.get(CacheService);
    usersRepository = module.get(getRepositoryToken(UserEntity));
    articlesService = module.get(ArticlesService);
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('prisma should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateUserCache', () => {
    beforeEach(() => {
      jest.spyOn(service, 'updateItemCache');
    });

    it('should be defined', () => {
      expect(service.updateItemCache).toBeDefined();
    });

    it('should update cache', async () => {
      jest.spyOn(cacheService, 'set');
      jest.spyOn(cacheService, 'delete');

      await service.updateItemCache(mockUserEntities[0]);

      expect(cacheService.delete).toHaveBeenCalledTimes(1);
      expect(cacheService.set).toHaveBeenCalledTimes(1);

      expect(cacheService.delete).toHaveBeenCalledWith(ALL_USERS_CACHE_KEY);
      expect(cacheService.set).toHaveBeenCalledWith(
        UserCacheKey(mockUserEntities[0].email),
        mockUserEntities[0],
      );
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findAll');
    });

    it('should be defined', () => {
      expect(service.findAll).toBeDefined();
    });

    it('should return users', async () => {
      jest
        .spyOn(usersRepository, 'find')
        .mockResolvedValueOnce(mockUserEntities);

      const users = await service.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(users).toEqual(mockUserEntities);
    });
  });

  describe('findByEmail', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findByEmail');
    });

    it('should be defined', () => {
      expect(service.findByEmail).toBeDefined();
    });

    it('should call service.findByEmail', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValueOnce(mockUserEntities[0]);

      service.findByEmail(mockUsers[0].email);
    });

    it('should get a single user', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValueOnce(mockUserEntities[0]);

      const found = await service.findByEmail(mockUsers[0].email);

      expect(service.findByEmail).toHaveBeenCalledTimes(1);
      expect(found).toEqual(mockUsers[0]);
    });
  });

  describe('create', () => {
    beforeEach(() => {
      jest.spyOn(service, 'signUp');
      jest
        .spyOn(usersRepository, 'create')
        .mockReturnValueOnce(mockUserEntities[0]);
      jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValueOnce(mockUserEntities[0]);
    });

    it('should be defined', () => {
      expect(service.signUp).toBeDefined();
    });

    it('should call repository.create and repository.save once', async () => {
      await service.signUp({ email: mockUsers[0].email, password: '12345' });
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should successfully create an user', () => {
      expect(
        service.signUp({ email: mockUsers[0].email, password: '12345' }),
      ).resolves.toEqual(mockUserEntities[0]);
    });

    it('should update cache', async () => {
      jest.spyOn(service, 'updateItemCache');

      const result = await service.signUp({
        email: mockUsers[0].email,
        password: '12345',
      });

      expect(result).toEqual(mockUserEntities[0]);

      expect(service.updateItemCache).toHaveBeenCalledTimes(1);
      expect(service.updateItemCache).toHaveBeenCalledWith(mockUserEntities[0]);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.spyOn(service, 'update');
    });

    it('should be defined', () => {
      expect(service.update).toBeDefined();
    });

    it('should call repository.findOneBy and repository.update', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValueOnce(mockUserEntities[0]);
      jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValueOnce(mockUserEntities[0]);
      jest.spyOn(mockUserEntities[0], 'setPassword');

      await service.update(mockUserEntities[0].email, {
        password: '12345',
      });

      expect(mockUserEntities[0].setPassword).toHaveBeenCalledWith('12345');
      expect(usersRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should update an user', () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValueOnce(mockUserEntities[0]);
      jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValueOnce(mockUserEntities[0]);

      expect(
        service.update(mockUserEntities[0].email, { password: '12345' }),
      ).resolves.toEqual(mockUserEntities[0]);
    });

    it('should update cache', async () => {
      jest.spyOn(service, 'updateItemCache');
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValueOnce(mockUserEntities[0]);
      jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValueOnce(mockUserEntities[0]);

      const result = await service.update(mockUsers[0].email, {
        password: '12345',
      });

      expect(result).toEqual(mockUserEntities[0]);

      expect(service.updateItemCache).toHaveBeenCalledTimes(1);
      expect(service.updateItemCache).toHaveBeenCalledWith(mockUserEntities[0]);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      jest.spyOn(service, 'delete');
    });

    it('should be defined', () => {
      expect(service.delete).toBeDefined();
    });

    it('should call usersRepository.delete and articlesService.findByEmail', async () => {
      jest
        .spyOn(articlesService, 'findByUserEmail')
        .mockResolvedValueOnce([mockArticleEntities[0]]);
      jest
        .spyOn(usersRepository, 'delete')
        .mockResolvedValueOnce({ affected: 1, raw: '' });

      await service.delete(mockUserEntities[0].email);

      expect(usersRepository.delete).toHaveBeenCalledWith({
        email: mockUserEntities[0].email,
      });
      expect(articlesService.findByUserEmail).toHaveBeenCalledWith(
        mockUserEntities[0].email,
      );
    });

    it('should delete an user', () => {
      jest
        .spyOn(articlesService, 'findByUserEmail')
        .mockResolvedValueOnce([mockArticleEntities[0]]);
      jest
        .spyOn(usersRepository, 'delete')
        .mockResolvedValueOnce({ affected: 1, raw: '' });

      expect(service.delete(mockUserEntities[0].email)).resolves.toEqual({
        deleted: true,
      });
    });

    it('should update cache', async () => {
      jest.spyOn(cacheService, 'delete');
      jest
        .spyOn(articlesService, 'findByUserEmail')
        .mockResolvedValueOnce([mockArticleEntities[0]]);
      jest
        .spyOn(usersRepository, 'delete')
        .mockResolvedValueOnce({ affected: 1, raw: '' });

      const result = await service.delete(mockUserEntities[0].email);

      expect(result).toEqual({ deleted: true });

      expect(cacheService.delete).toHaveBeenCalledWith(ALL_ARTICLES_CACHE_KEY);
      expect(cacheService.delete).toHaveBeenCalledWith(ALL_USERS_CACHE_KEY);
      expect(cacheService.delete).toHaveBeenCalledWith(
        UserCacheKey(mockUserEntities[0].email),
      );
      expect(cacheService.deleteMany).toHaveBeenCalledWith([
        ArticleIdCacheKey(mockArticleEntities[0].id),
      ]);
    });
  });
});
