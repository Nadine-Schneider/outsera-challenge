import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProducerWin } from './award-intervals.types';
import { Producer } from './entities';

interface ProducerWinRow {
  producer: string;
  year: number | string;
}

@Injectable()
export class ProducersRepository {
  constructor(
    @InjectRepository(Producer)
    private readonly producers: Repository<Producer>,
  ) {}

  async findAwardWins(): Promise<ProducerWin[]> {
    const rows = await this.producers
      .createQueryBuilder('producer')
      .innerJoin('producer.movies', 'movie')
      .select('producer.name', 'producer')
      .addSelect('movie.year', 'year')
      .where('movie.winner = :winner', { winner: true })
      .orderBy('producer.name', 'ASC')
      .addOrderBy('movie.year', 'ASC')
      .getRawMany<ProducerWinRow>();

    return rows.map(({ producer, year }) => ({
      producer,
      year: Number(year),
    }));
  }
}
