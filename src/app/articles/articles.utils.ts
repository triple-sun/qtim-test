import { UserEntity } from '../users/user.entity';
import { IArticle } from './article.interface';
import { faker } from '@faker-js/faker';

export const ArticleIdCacheKey = (id: number) => `articles:id:${id}`;

export const createMockArticle = (i: number, createdBy: UserEntity): IArticle => ({
  id: i,
  title: faker.company.catchPhrase(),
  text: faker.lorem.sentences(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  createdBy,
});
