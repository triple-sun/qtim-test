import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';
import { LoggerModule } from '../logger/logger.module';
import { ClsModule } from 'nestjs-cls';
import { nanoid } from 'nanoid';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ArticlesModule } from './articles.module';
import { CreateArticleDto } from './articles.dto';
import { mockArticleEntities } from './articles.mocks';
import { mockUsers } from '../users/users.mocks';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ArticleEntity } from './article.entity';
import { Repository } from 'typeorm';

describe('ArticlesController', () => {
  let articlesController: ArticlesController;
  let articlesService: DeepMockProxy<ArticlesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forFeature({
          name: ArticlesModule.name,
        }),
        ClsModule.forRoot({
          middleware: {
            mount: true,
            generateId: true,
            idGenerator: (req: Request) =>
              req.headers['X-Request-Id'] ?? nanoid(),
          },
          global: true,
        }),
      ],
      controllers: [ArticlesController],
      providers: [
        JwtService,
        {
          provide: ArticlesService,
          useValue: mockDeep(ArticlesService),
        },
        {
          provide: getRepositoryToken(ArticleEntity),
          useValue: mockDeep<Repository<ArticleEntity>>(),
        },
      ],
    }).compile();

    articlesController = module.get(ArticlesController);
    articlesService = module.get(ArticlesService);
  });

  it('should be defined', () => {
    expect(articlesController).toBeDefined();
    expect(articlesService).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      jest
        .spyOn(articlesService, 'create')
        .mockResolvedValue(mockArticleEntities[0]);
    });

    it('should be defined', () => {
      expect(articlesController.create).toBeDefined();
    });

    it('should create an article', async () => {
      const dto = mockArticleEntities[0] as CreateArticleDto;
      const user = mockUsers[0];

      const result = await articlesController.create(dto, user);

      expect(result).toEqual(mockArticleEntities[0]);

      expect(articlesService.create).toHaveBeenCalled();
      expect(articlesService.create).toHaveBeenCalledWith(dto, user);
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      jest
        .spyOn(articlesService, 'findAll')
        .mockResolvedValue(mockArticleEntities);
    });

    it('should be defined', () => {
      expect(articlesController.findAll).toBeDefined();
    });

    it('should return an array of articles', async () => {
      const result = await articlesController.findAll();

      expect(result).toEqual(mockArticleEntities);
      expect(articlesService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    beforeEach(() => {
      jest
        .spyOn(articlesService, 'findById')
        .mockResolvedValue(mockArticleEntities[0]);
    });

    it('should be defined', () => {
      expect(articlesController.findById).toBeDefined();
    });

    it('should find an article by id and return its data', async () => {
      const result = await articlesController.findById({
        id: mockArticleEntities[0].id,
      });

      expect(result).toEqual(mockArticleEntities[0]);
      expect(articlesService.findById).toHaveBeenCalled();
      expect(articlesService.findById).toHaveBeenCalledWith(
        mockArticleEntities[0].id,
      );
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest
        .spyOn(articlesService, 'update')
        .mockResolvedValue(mockArticleEntities[0]);
    });

    it('should be defined', () => {
      expect(articlesController.update).toBeDefined();
    });

    it('should find an article by id and update its data', async () => {
      const id = mockArticleEntities[0].id;
      const dto = mockArticleEntities[0];

      const result = await articlesController.update({ id }, dto);

      expect(result).toEqual(mockArticleEntities[0]);
      expect(articlesService.update).toHaveBeenCalled();
      expect(articlesService.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      jest
        .spyOn(articlesService, 'delete')
        .mockResolvedValue({ deleted: true });
    });

    it('should be defined', () => {
      expect(articlesController.delete).toBeDefined();
    });

    it('should find an artiucle by id, remove and then return status', async () => {
      const id = mockArticleEntities[0].id;

      const result = await articlesController.delete({ id });

      expect(result).toEqual({ deleted: true });
      expect(articlesService.delete).toHaveBeenCalled();
      expect(articlesService.delete).toHaveBeenCalledWith(id);
    });
  });
});
