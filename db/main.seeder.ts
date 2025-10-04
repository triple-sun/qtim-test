import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Logger } from '@nestjs/common';
import { ArticleEntity } from '../src/app/articles/article.entity';
import { UserEntity } from '../src/app/users/user.entity';
import { createMockUser } from '../src/app/users/users.utils';
import { createMockArticle } from '../src/app/articles/articles.utils';
import { faker } from '@faker-js/faker';

export class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const articlesRepository = dataSource.getRepository(ArticleEntity);
    const userFactory = factoryManager.get(UserEntity);
    const articleFactory = factoryManager.get(ArticleEntity);

    Logger.log('seeding users...');
    const users = await userFactory.saveMany(10);
    Logger.log('done seeding users...');

    Logger.log('seeding articles...');
    const articles = await Promise.all(
      Array(50)
        .fill('')
        .map(async (_, i) => {
          return await articleFactory.make({
            createdBy: faker.helpers.arrayElement(users),
          });
        }),
    );
    await articlesRepository.save(articles);

    Logger.log('done seeding articles!');
  }
}
