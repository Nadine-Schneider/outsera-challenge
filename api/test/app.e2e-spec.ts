import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp, SWAGGER_PATH } from '../src/app.setup';

describe('Application bootstrap (e2e)', () => {
  let app: INestApplication;
  let httpServer: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    httpServer = app.getHttpServer() as App;
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the Swagger UI', async () => {
    const response = await request(httpServer).get(`/${SWAGGER_PATH}`);

    expect(response.status).toBe(200);
    expect(response.text).toContain('<div id="swagger-ui"></div>');
  });

  it('serves the OpenAPI document', async () => {
    const response = await request(httpServer).get(`/${SWAGGER_PATH}-json`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      info: { title: 'Golden Raspberry Awards API', version: '1.0.0' },
    });
  });
});
