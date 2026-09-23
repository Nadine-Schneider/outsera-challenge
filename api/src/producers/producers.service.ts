import { Injectable } from '@nestjs/common';
import { calculateAwardIntervals } from './award-intervals/award-intervals.calculator';
import { AwardIntervals } from './award-intervals/award-intervals.types';
import { ProducersRepository } from './producers.repository';

@Injectable()
export class ProducersService {
  constructor(private readonly producersRepository: ProducersRepository) {}

  async getAwardIntervals(): Promise<AwardIntervals> {
    return calculateAwardIntervals(
      await this.producersRepository.findAwardWins(),
    );
  }
}
