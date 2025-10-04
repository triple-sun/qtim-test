import 'dotenv/config';

import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { ArticleFactory } from './factories/article.factory';
import { UserFactory } from './factories/user.factory';
import { MainSeeder } from './main.seeder';
import { UserEntity } from '../src/app/users/user.entity';
import { ArticleEntity } from '../src/app/articles/article.entity';

const config = new ConfigService();

export const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: config.get<string>('DB_HOST'),
  port: config.get<number>('DB_PORT'),
  username: config.get<string>('DB_USER'),
  password: config.get<string>('DB_PASS'),
  database: config.get<string>('DB_NAME'),
  entities: [UserEntity, ArticleEntity],
  migrations: ['./db/migrations/*.ts'],
  factories: [UserFactory, ArticleFactory],
  seeds: [MainSeeder],
};

export default new DataSource(dataSourceOptions);
