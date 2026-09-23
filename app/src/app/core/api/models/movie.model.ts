export interface Movie {
  readonly id: number;
  readonly year: number;
  readonly title: string;
  readonly studios: string[];
  readonly producers: string[];
  readonly winner: boolean;
}

export interface MoviesQuery {
  readonly page: number;
  readonly size: number;
  readonly year?: number;
  readonly winner?: boolean;
}

/**
 * OpenAPI and the live API return an array; the challenge PDF shows a single object, so both
 * are accepted. `null` covers an empty body, which HttpClient parses as null.
 */
export type WinnersByYearResponse = Movie[] | Movie | null;
