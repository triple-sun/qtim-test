import { plainToInstance } from 'class-transformer';
import { IUser } from './user.interface';
import { UserEntity } from './user.entity';
import { createMockUser } from './users.utils';

export const mockUsers: IUser[] = Array(10)
  .fill(0)
  .map((_, i) => createMockUser(i));

export const mockUserEntities = plainToInstance(UserEntity, mockUsers);
