import 'dotenv/config';

import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from '../app/users/user.entity';
import { ArticleEntity } from '../app/articles/article.entity';
import { SeederOptions } from 'typeorm-extension';
import { MainSeeder } from './main.seeder';
import { ArticleFactory } from './factories/article.factory';
import { UserFactory } from './factories/user.factory';

const config = new ConfigService();

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: config.get<string>('DB_HOST'),
  port: config.get<number>('DB_PORT'),
  username: config.get<string>('DB_USER'),
  password: config.get<string>('DB_PASS'),
  database: config.get<string>('DB_NAME'),
  entities: [UserEntity, ArticleEntity],
  migrations: ['./dist/*-migrations.ts'],
  factories: [ArticleFactory, UserFactory],
  seeds: [MainSeeder],
};

export default new DataSource(dataSourceOptions);
