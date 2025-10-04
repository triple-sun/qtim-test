import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ArticlesService } from './articles.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ArticlesController } from './articles.controller';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { ArticlesModule } from './articles.module';
import { mockArticleEntities } from './articles.mocks';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { globalValidationPipe } from '../../config/validation.config';

describe('ArticlesModule', () => {
  let app: INestApplication;
  let articlesService: DeepMockProxy<ArticlesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forFeature({
          name: ArticlesModule.name,
        }),
      ],
      controllers: [ArticlesController],
      providers: [
        JwtService,
        ArticlesService,
        {
          provide: getRepositoryToken(ArticleEntity),
          useValue: mockDeep<Repository<ArticleEntity>>(),
        },
      ],
    })
      .overrideProvider(ArticlesService)
      .useValue(mockDeep(ArticlesService))
      .overrideGuard(JwtAuthGuard)
      .useValue({})
      .compile();

    app = module.createNestApplication();

    app.useGlobalPipes(globalValidationPipe);

    await app.init();

    articlesService = await app.get(ArticlesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST: articles/create', () => {
    it('should return created article', async () => {
      jest
        .spyOn(articlesService, 'create')
        .mockResolvedValue(mockArticleEntities[0]);

      const response = await request(app.getHttpServer())
        .post('/articles/create')
        .send(mockArticleEntities[0])
        .expect(201);

      expect(plainToInstance(ArticleEntity, response.body)).toEqual(
        mockArticleEntities[0],
      );
    });

    it('should return 400 if dto is wrong', async () => {
      jest
        .spyOn(articlesService, 'create')
        .mockResolvedValue(mockArticleEntities[0]);

      await request(app.getHttpServer())
        .post('/articles/create')
        .send({ title: true })
        .expect(400);
    });
  });

  describe('GET: articles/:id', () => {
    it('should return OK', async () => {
      jest
        .spyOn(articlesService, 'findById')
        .mockResolvedValue(mockArticleEntities[0]);

      const response = await request(app.getHttpServer())
        .get(`/articles/${mockArticleEntities[0].id}`)
        .expect(200);

      expect(plainToInstance(ArticleEntity, response.body)).toEqual(
        mockArticleEntities[0],
      );
    });

    it('should return 400 if id is wrong', async () => {
      jest
        .spyOn(articlesService, 'findById')
        .mockResolvedValue(mockArticleEntities[0]);

      await request(app.getHttpServer()).get(`/articles/abc`).expect(400);
    });

    it('should return 404 if article was not found', async () => {
      jest.spyOn(articlesService, 'findById').mockResolvedValue(undefined);

      await request(app.getHttpServer()).get(`/articles/${0}`).expect(404);
    });
  });

  describe('GET: articles/', () => {
    beforeEach(() => {
      jest
        .spyOn(articlesService, 'findAll')
        .mockResolvedValue(mockArticleEntities);
    });

    it('should return articles', async () => {
      const response = await request(app.getHttpServer())
        .get(`/articles`)
        .expect(200);

      expect(plainToInstance(ArticleEntity, response.body)).toEqual(
        mockArticleEntities,
      );
    });
  });

  describe('PUT: articles/update/:id', () => {
    it('should return OK', async () => {
      jest
        .spyOn(articlesService, 'findById')
        .mockResolvedValue(mockArticleEntities[0]);
      jest
        .spyOn(articlesService, 'update')
        .mockResolvedValue(mockArticleEntities[0]);

      const response = await request(app.getHttpServer())
        .put(`/articles/update/${mockArticleEntities[0].id}`)
        .expect(200);

      expect(plainToInstance(ArticleEntity, response.body)).toEqual(
        mockArticleEntities[0],
      );
    });

    it('should return 400 if id is wrong', async () => {
      jest
        .spyOn(articlesService, 'findById')
        .mockResolvedValue(mockArticleEntities[0]);

      await request(app.getHttpServer())
        .put(`/articles/update/abc`)
        .expect(400);
    });

    it('should return 404 if article was not found', async () => {
      jest.spyOn(articlesService, 'findById').mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .put(`/articles/update/${0}`)
        .expect(404);
    });
  });

  describe('DELETE: articles/delete/:id', () => {
    it('should return OK if article exists', async () => {
      jest
        .spyOn(articlesService, 'findById')
        .mockResolvedValue(mockArticleEntities[0]);
      jest
        .spyOn(articlesService, 'delete')
        .mockResolvedValue({ deleted: true });

      await request(app.getHttpServer())
        .delete(`/articles/delete/${mockArticleEntities[0].id}`)
        .expect(200, { deleted: true });
    });

    it('should return 400 if id is wrong', async () => {
      jest
        .spyOn(articlesService, 'findById')
        .mockResolvedValue(mockArticleEntities[0]);

      await request(app.getHttpServer())
        .delete(`/articles/delete/abc`)
        .expect(400);
    });

    it('should return 404 if article was not found', async () => {
      jest.spyOn(articlesService, 'findById').mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/articles/delete/${0}`)
        .expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
