import { Module } from '@nestjs/common';
import { AppConfigModule } from './config';
import { CsvImportModule } from './csv-import/csv-import.module';
import { DatabaseModule } from './database';
import { MoviesModule } from './movies/movies.module';
import { ProducersModule } from './producers/producers.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    CsvImportModule,
    MoviesModule,
    ProducersModule,
  ],
})
export class AppModule {}
