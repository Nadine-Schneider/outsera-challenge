import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producer } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Producer])],
})
export class ProducersModule {}
