import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie, Producer, Studio } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Producer, Studio])],
  exports: [TypeOrmModule],
})
export class MoviesModule {}
