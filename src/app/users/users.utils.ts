import { faker } from '@faker-js/faker';
import { IUser } from './user.interface';

export const UserCacheKey = (email: string) => `users:${email}`;

export const createMockUser = (i: number): IUser => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
});
