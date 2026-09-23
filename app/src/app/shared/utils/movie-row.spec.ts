import { Movie } from '../../core/api/models/movie.model';
import { toMovieRow, toMovieRows } from './movie-row';

const CANT_STOP_THE_MUSIC: Movie = {
  id: 1,
  year: 1980,
  title: "Can't Stop the Music",
  studios: ['Associated Film Distribution'],
  producers: ['Allan Carr'],
  winner: true,
};

const CRUISING: Movie = {
  id: 2,
  year: 1980,
  title: 'Cruising',
  studios: ['Lorimar Productions', 'United Artists'],
  producers: ['Jerry Weintraub'],
  winner: false,
};

describe('toMovieRow', () => {
  it('keeps id, year and title and shows a winner as "Yes"', () => {
    expect(toMovieRow(CANT_STOP_THE_MUSIC)).toEqual({
      id: 1,
      year: 1980,
      title: "Can't Stop the Music",
      winner: 'Yes',
    });
  });

  it('shows a non-winner as "No"', () => {
    expect(toMovieRow(CRUISING)).toEqual({ id: 2, year: 1980, title: 'Cruising', winner: 'No' });
  });
});

describe('toMovieRows', () => {
  it('converts every movie in order', () => {
    expect(toMovieRows([CANT_STOP_THE_MUSIC, CRUISING]).map((row) => row.winner)).toEqual([
      'Yes',
      'No',
    ]);
  });

  it('returns an empty list for an empty list', () => {
    expect(toMovieRows([])).toEqual([]);
  });
});
