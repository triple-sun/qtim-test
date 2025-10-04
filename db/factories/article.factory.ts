import { Faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { ArticleEntity } from '../../src/app/articles/article.entity';

export const ArticleFactory = setSeederFactory(
  ArticleEntity,
  (faker: Faker) => {
    const property = new ArticleEntity();
    property.title = faker.company.catchPhrase();
    property.text = faker.lorem.paragraphs();
    return property;
  },
);
