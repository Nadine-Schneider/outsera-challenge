export interface ProducerWin {
  producer: string;
  year: number;
}

export interface ProducerInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

export interface AwardIntervals {
  min: ProducerInterval[];
  max: ProducerInterval[];
}
