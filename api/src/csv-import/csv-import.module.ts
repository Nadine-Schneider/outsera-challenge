import { Module } from '@nestjs/common';
import { MoviesModule } from '../movies/movies.module';
import { CsvImportService } from './csv-import.service';

@Module({
  imports: [MoviesModule],
  providers: [CsvImportService],
})
export class CsvImportModule {}
