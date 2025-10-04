import { faker } from '@faker-js/faker';
import { IUser } from './user.interface';

export const UserEmailCacheKey = (email: string) => `users:email:${email}`;

export const createMockUser = (i: number): IUser => ({
  id: i,
  email: faker.internet.email(),
  password: faker.internet.password(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});
