export interface StudioWithWinCount {
  readonly name: string;
  readonly winCount: number;
}

export interface StudiosWithWinCountResponse {
  readonly studios: StudioWithWinCount[];
}
