import { Movie } from '../../core/api/models/movie.model';

export interface MovieRow {
  readonly id: number;
  readonly year: number;
  readonly title: string;
  readonly winner: 'Yes' | 'No';
}

export function toMovieRow(movie: Movie): MovieRow {
  return {
    id: movie.id,
    year: movie.year,
    title: movie.title,
    winner: movie.winner ? 'Yes' : 'No',
  };
}

export function toMovieRows(movies: readonly Movie[]): MovieRow[] {
  return movies.map(toMovieRow);
}
