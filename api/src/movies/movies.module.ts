import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie, Studio } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Studio])],
})
export class MoviesModule {}
