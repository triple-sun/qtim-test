import '../../config/dayjs.config';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Between, Like, Repository } from 'typeorm';
import dayjs from 'dayjs';

import { ArticlesService } from './articles.service';
import { ArticleEntity } from './article.entity';
import { CacheService } from '../cache/cache.service';
import { CacheModule } from '../cache/cache.module';
import { ALL_ARTICLES_CACHE_KEY } from './articles.const';
import { mockArticleEntities, mockArticles } from './articles.mocks';
import { mockUsers } from '../users/users.mocks';
import { ArticleIdCacheKey } from './articles.utils';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let cacheService: DeepMockProxy<CacheService>;
  let articlesRepository: DeepMockProxy<Repository<ArticleEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule],
      providers: [
        ArticlesService,
        CacheService,
        {
          provide: getRepositoryToken(ArticleEntity),
          useValue: mockDeep<Repository<ArticleEntity>>(),
        },
      ],
    })
      .overrideProvider(CacheService)
      .useValue(mockDeep<CacheService>())
      .compile();

    service = module.get(ArticlesService);
    cacheService = module.get(CacheService);
    articlesRepository = module.get(getRepositoryToken(ArticleEntity));
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('repository should be defined', () => {
    expect(articlesRepository).toBeDefined();
  });

  describe('updateCache', () => {
    beforeEach(() => {
      jest.spyOn(cacheService, 'set');
      jest.spyOn(cacheService, 'delete');
    });

    it('should reset all articles cache', () => {});
  });

  describe('findAll', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findAll');
    });

    it('should be defined', () => {
      expect(service.findAll).toBeDefined();
    });

    it('should call service.findAll', () => {
      jest
        .spyOn(articlesRepository, 'find')
        .mockResolvedValueOnce(mockArticleEntities);

      service.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should get cached articles if cache has articles', async () => {
      jest
        .spyOn(cacheService, 'get')
        .mockResolvedValueOnce(mockArticleEntities);

      const result = await service.findAll();

      expect(result).toEqual(mockArticleEntities);

      expect(cacheService.get<ArticleEntity>).toHaveBeenCalledTimes(1);
      expect(cacheService.get<ArticleEntity>).toHaveBeenCalledWith(
        ALL_ARTICLES_CACHE_KEY,
      );
    });

    it('should set cached articles if cache is empty', async () => {
      jest.spyOn(cacheService, 'set');
      jest.spyOn(cacheService, 'get').mockResolvedValueOnce(undefined);
      jest
        .spyOn(articlesRepository, 'find')
        .mockResolvedValueOnce(mockArticleEntities);

      const result = await service.findAll();

      expect(result).toEqual(mockArticleEntities);

      expect(articlesRepository.find).toHaveBeenCalledWith({
        relations: ['createdBy'],
      });
      expect(articlesRepository.find).toHaveBeenCalledTimes(1);

      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(cacheService.set).toHaveBeenCalledTimes(1);

      expect(cacheService.get).toHaveBeenCalledWith(ALL_ARTICLES_CACHE_KEY);
      expect(cacheService.set).toHaveBeenCalledWith(
        ALL_ARTICLES_CACHE_KEY,
        mockArticleEntities,
      );
    });
  });

  describe('findMany', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findMany');
    });

    it('should be defined', () => {
      expect(service.findMany).toBeDefined();
    });

    it('should call service.findMany', async () => {
      jest
        .spyOn(articlesRepository, 'find')
        .mockResolvedValueOnce(mockArticleEntities);

      await service.findMany({});

      expect(service.findMany).toHaveBeenCalledTimes(1);
    });

    it('should get articles', async () => {
      jest
        .spyOn(articlesRepository, 'find')
        .mockResolvedValueOnce(mockArticleEntities);

      const result = await service.findMany({});

      expect(result).toEqual(mockArticleEntities);
      expect(articlesRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should query articles', async () => {
      jest
        .spyOn(articlesRepository, 'find')
        .mockResolvedValueOnce(mockArticleEntities);

      const result = await service.findMany({
        id: 1,
        title: 'testTitle',
        text: 'testText',
        createdByEmail: 'test@email.com',
        createdAt: '29.01.2022',
        page: 2,
        take: 2,
      });

      expect(result).toEqual(mockArticleEntities);
      expect(articlesRepository.find).toHaveBeenCalledTimes(1);
      expect(articlesRepository.find).toHaveBeenCalledWith({
        where: {
          id: 1,
          title: Like(`%testTitle%`),
          text: Like(`%testText%`),
          createdBy: { email: 'test@email.com' },
          createdAt: Between(
            dayjs('29.01.2022', 'DD.MM.YYYY').toDate(),
            dayjs('29.01.2022', 'DD.MM.YYYY').add(1, 'day').toDate(),
          ),
        },
        take: 2,
        skip: 2 * 2,
      });
    });
  });

  describe('findById', () => {
    beforeEach(() => {
      jest.spyOn(service, 'findById');
    });

    it('should be defined', () => {
      expect(service.findById).toBeDefined();
    });

    it('should call service.findOneById', async () => {
      jest
        .spyOn(articlesRepository, 'findOneBy')
        .mockResolvedValueOnce(mockArticleEntities[0]);

      await service.findById(0);

      expect(service.findById).toHaveBeenCalledTimes(1);
    });

    it('should call repository.findOneBy', async () => {
      jest
        .spyOn(articlesRepository, 'findOneBy')
        .mockResolvedValueOnce(mockArticleEntities[0]);

      await service.findById(0);

      expect(articlesRepository.findOneBy).toHaveBeenCalledTimes(1);
    });

    it('should get a single article', () => {
      jest
        .spyOn(articlesRepository, 'findOneBy')
        .mockResolvedValueOnce(mockArticleEntities[0]);

      expect(service.findById(0)).resolves.toEqual(mockArticleEntities[0]);
    });

    it('should get cached article if cache has an article', async () => {
      jest
        .spyOn(cacheService, 'get')
        .mockResolvedValueOnce(mockArticleEntities[0]);

      const result = await service.findById(mockArticleEntities[0].id);

      expect(result).toEqual(mockArticleEntities[0]);

      expect(cacheService.get<ArticleEntity>).toHaveBeenCalledTimes(1);
      expect(cacheService.get<ArticleEntity>).toHaveBeenCalledWith(
        ArticleIdCacheKey(mockArticleEntities[0].id),
      );
    });

    it('should set cached articles if its not in cache', async () => {
      jest.spyOn(cacheService, 'set');
      jest.spyOn(cacheService, 'get').mockResolvedValueOnce(undefined);
      jest
        .spyOn(articlesRepository, 'findOneBy')
        .mockResolvedValue(mockArticleEntities[0]);

      const result = await service.findById(mockArticleEntities[0].id);

      expect(result).toEqual(mockArticleEntities[0]);

      expect(articlesRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(cacheService.get).toHaveBeenCalledTimes(1);
      expect(cacheService.set).toHaveBeenCalledTimes(1);

      expect(articlesRepository.findOneBy).toHaveBeenCalledWith({
        id: mockArticleEntities[0].id,
      });
      expect(cacheService.get).toHaveBeenCalledWith(
        ArticleIdCacheKey(mockArticleEntities[0].id),
      );
      expect(cacheService.set).toHaveBeenCalledWith(
        ArticleIdCacheKey(mockArticleEntities[0].id),
        mockArticleEntities[0],
      );
    });
  });

  describe('create', () => {
    beforeEach(() => {
      jest.spyOn(service, 'create');
      jest
        .spyOn(articlesRepository, 'create')
        .mockReturnValueOnce(mockArticleEntities[0]);
      jest
        .spyOn(articlesRepository, 'save')
        .mockResolvedValueOnce(mockArticleEntities[0]);
    });

    it('should be defined', () => {
      expect(service.create).toBeDefined();
    });

    it('should call repository.create and repository.save once', async () => {
      await service.create({} as any, mockUsers[0]);
      expect(articlesRepository.create).toHaveBeenCalledTimes(1);
      expect(articlesRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should successfully create an article', () => {
      expect(
        service.create(mockArticleEntities[0], mockUsers[0]),
      ).resolves.toEqual(mockArticleEntities[0]);
    });

    it('should update cache', async () => {
      jest.spyOn(cacheService, 'set');
      jest.spyOn(cacheService, 'delete');

      const result = await service.create({} as any, mockUsers[0]);

      expect(result).toEqual(mockArticleEntities[0]);

      expect(cacheService.delete).toHaveBeenCalledTimes(1);
      expect(cacheService.set).toHaveBeenCalledTimes(1);

      expect(cacheService.delete).toHaveBeenCalledWith(ALL_ARTICLES_CACHE_KEY);
      expect(cacheService.set).toHaveBeenCalledWith(
        ArticleIdCacheKey(mockArticleEntities[0].id),
        mockArticleEntities[0],
      );
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
        .spyOn(articlesRepository, 'findOneBy')
        .mockResolvedValueOnce(mockArticleEntities[0]);
      jest
        .spyOn(articlesRepository, 'save')
        .mockResolvedValueOnce(mockArticleEntities[0]);

      await service.update(0, mockArticles[0]);

      expect(articlesRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(articlesRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should update an article', () => {
      jest
        .spyOn(articlesRepository, 'findOneBy')
        .mockResolvedValueOnce(mockArticleEntities[0]);
      jest
        .spyOn(articlesRepository, 'save')
        .mockResolvedValueOnce(mockArticleEntities[0]);

      expect(service.update(0, mockArticleEntities[0])).resolves.toEqual(
        mockArticleEntities[0],
      );
    });

    it('should update cache', async () => {
      jest.spyOn(cacheService, 'set');
      jest.spyOn(cacheService, 'delete');
      jest
        .spyOn(articlesRepository, 'findOneBy')
        .mockResolvedValueOnce(mockArticleEntities[0]);
      jest
        .spyOn(articlesRepository, 'save')
        .mockResolvedValueOnce(mockArticleEntities[0]);

      const result = await service.update(
        mockArticleEntities[0].id,
        mockArticleEntities[0],
      );

      expect(result).toEqual(mockArticleEntities[0]);

      expect(cacheService.delete).toHaveBeenCalledTimes(1);
      expect(cacheService.set).toHaveBeenCalledTimes(1);

      expect(articlesRepository.findOneBy).toHaveBeenCalledWith({
        id: mockArticleEntities[0].id,
      });
      expect(cacheService.delete).toHaveBeenCalledWith(ALL_ARTICLES_CACHE_KEY);
      expect(cacheService.set).toHaveBeenCalledWith(
        ArticleIdCacheKey(mockArticleEntities[0].id),
        mockArticleEntities[0],
      );
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      jest.spyOn(service, 'delete');
    });

    it('should be defined', () => {
      expect(service.delete).toBeDefined();
    });

    it('should call service.delete', async () => {
      jest
        .spyOn(articlesRepository, 'delete')
        .mockResolvedValueOnce({ affected: 1, raw: '' });

      await service.delete(0);
      expect(service.delete).toHaveBeenCalledTimes(1);
    });

    it('should delete an article', () => {
      jest
        .spyOn(articlesRepository, 'delete')
        .mockResolvedValueOnce({ affected: 1, raw: '' });

      expect(service.delete(0)).resolves.toEqual({ deleted: true });
    });

    it('should update cache', async () => {
      jest.spyOn(cacheService, 'delete');
      jest
        .spyOn(articlesRepository, 'delete')
        .mockResolvedValueOnce({ affected: 1, raw: '' });

      const result = await service.delete(mockArticleEntities[0].id);

      expect(result).toEqual({ deleted: true });

      expect(cacheService.delete).toHaveBeenCalledTimes(2);
      expect(cacheService.delete).toHaveBeenCalledWith(ALL_ARTICLES_CACHE_KEY);
      expect(cacheService.delete).toHaveBeenCalledWith(
        ArticleIdCacheKey(mockArticleEntities[0].id),
      );
    });
  });
});
