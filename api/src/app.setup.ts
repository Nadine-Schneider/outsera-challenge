import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'api-docs';

export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Golden Raspberry Awards API')
      .setDescription(
        'Indicados e vencedores da categoria Pior Filme do Golden Raspberry Awards.',
      )
      .setVersion('1.0.0')
      .build(),
  );

  SwaggerModule.setup(SWAGGER_PATH, app, document);
}
