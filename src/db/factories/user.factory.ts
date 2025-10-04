import { Faker } from '@faker-js/faker';
import { UserEntity } from '../../app/users/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export const UserFactory = setSeederFactory(UserEntity, (faker: Faker) => {
  const user = new UserEntity();
  user.email = faker.internet.email();
  user.password = faker.internet.password();
  return user;
});
