import 'reflect-metadata';
import 'es6-shim';
import 'dotenv/config';
import 'source-map-support/register';

import datasource from './datasource';
import { runSeeders } from 'typeorm-extension';

datasource.initialize().then(async () => {
  await datasource.synchronize(true);
  await runSeeders(datasource);
  process.exit();
});
