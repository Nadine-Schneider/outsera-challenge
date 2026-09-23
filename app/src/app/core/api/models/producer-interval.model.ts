export interface ProducerInterval {
  readonly producer: string;
  readonly interval: number;
  readonly previousWin: number;
  readonly followingWin: number;
}

export interface MaxMinWinIntervals {
  readonly min: ProducerInterval[];
  readonly max: ProducerInterval[];
}
