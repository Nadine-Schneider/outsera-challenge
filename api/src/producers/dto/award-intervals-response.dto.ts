import { ApiProperty } from '@nestjs/swagger';
import { AwardIntervals, ProducerInterval } from '../award-intervals.types';

export class ProducerIntervalDto implements ProducerInterval {
  @ApiProperty({ description: 'Nome do produtor.', example: 'Producer 1' })
  producer!: string;

  @ApiProperty({
    description: 'Anos entre as duas vitórias consecutivas.',
    example: 1,
  })
  interval!: number;

  @ApiProperty({ description: 'Ano da vitória anterior.', example: 2008 })
  previousWin!: number;

  @ApiProperty({ description: 'Ano da vitória seguinte.', example: 2009 })
  followingWin!: number;
}

export class AwardIntervalsResponseDto implements AwardIntervals {
  @ApiProperty({
    description:
      'Todos os intervalos empatados no menor valor, ordenados por previousWin e producer.',
    type: [ProducerIntervalDto],
    example: [
      {
        producer: 'Producer 1',
        interval: 1,
        previousWin: 2008,
        followingWin: 2009,
      },
    ],
  })
  min!: ProducerIntervalDto[];

  @ApiProperty({
    description:
      'Todos os intervalos empatados no maior valor, ordenados por previousWin e producer.',
    type: [ProducerIntervalDto],
    example: [
      {
        producer: 'Producer 1',
        interval: 99,
        previousWin: 1900,
        followingWin: 1999,
      },
    ],
  })
  max!: ProducerIntervalDto[];
}
