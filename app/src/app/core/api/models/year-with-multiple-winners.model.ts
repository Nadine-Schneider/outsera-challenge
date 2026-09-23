export interface YearWithMultipleWinners {
  readonly year: number;
  readonly winnerCount: number;
}

export interface YearsWithMultipleWinnersResponse {
  readonly years: YearWithMultipleWinners[];
}
