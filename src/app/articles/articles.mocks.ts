import { plainToInstance } from 'class-transformer';
import { createMockArticle } from './articles.utils';
import { ArticleEntity } from './article.entity';
import { mockUserEntities } from '../users/users.mocks';
import { IArticle } from './article.interface';

export const mockArticles = Array(10)
  .fill(0)
  .map((_, i): IArticle => createMockArticle(i, mockUserEntities[0]));

export const mockArticleEntities = plainToInstance(ArticleEntity, mockArticles);
