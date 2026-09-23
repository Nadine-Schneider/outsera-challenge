import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp, SWAGGER_PATH } from './app.setup';
import { AppConfigService } from './config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  configureApp(app);
  app.enableShutdownHooks();

  const { port } = app.get(AppConfigService);
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on http://localhost:${port}`);
  logger.log(
    `Swagger UI is available at http://localhost:${port}/${SWAGGER_PATH}`,
  );
}

void bootstrap();
