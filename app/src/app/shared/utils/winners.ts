import { Movie, WinnersByYearResponse } from '../../core/api/models/movie.model';

/** Normalizes the `/winnersByYear` payload so callers always receive a list. */
export function normalizeWinners(response: WinnersByYearResponse | undefined): Movie[] {
  if (response == null) {
    return [];
  }
  return Array.isArray(response) ? response : [response];
}
