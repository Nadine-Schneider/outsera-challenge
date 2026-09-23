import { INestApplication } from '@nestjs/common';
import { join } from 'node:path';
import type { DataSource } from 'typeorm';

export interface TestApp {
  app: INestApplication;
  dataSource: DataSource;
}

export function fixturePath(fileName: string): string {
  return join(__dirname, '..', 'fixtures', fileName);
}

/**
 * Boots the full AppModule reading the CSV at `csvPath` through
 * MOVIELIST_CSV_PATH. The environment is validated once, when the
 * ConfigModule is first loaded, so the application is loaded in an isolated
 * module registry to pick up the path of each scenario.
 */
export async function createTestApp(csvPath: string): Promise<TestApp> {
  process.env.MOVIELIST_CSV_PATH = csvPath;

  let modules: IsolatedModules | undefined;
  jest.isolateModules(() => {
    modules = {
      testing: jest.requireActual('@nestjs/testing'),
      typeorm: jest.requireActual('typeorm'),
      appModule: jest.requireActual('../../src/app.module'),
      appSetup: jest.requireActual('../../src/app.setup'),
    };
  });
  if (!modules) {
    throw new Error('The application modules were not loaded.');
  }

  const { testing, typeorm, appModule, appSetup } = modules;
  const moduleFixture = await testing.Test.createTestingModule({
    imports: [appModule.AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication({ logger: false });
  appSetup.configureApp(app);
  await app.init();

  return { app, dataSource: app.get(typeorm.DataSource) };
}

interface IsolatedModules {
  testing: typeof import('@nestjs/testing');
  typeorm: typeof import('typeorm');
  appModule: typeof import('../../src/app.module');
  appSetup: typeof import('../../src/app.setup');
}
