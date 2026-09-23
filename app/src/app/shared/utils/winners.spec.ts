import { Movie } from '../../core/api/models/movie.model';
import { normalizeWinners } from './winners';

const howardTheDuck: Movie = {
  id: 36,
  year: 1986,
  title: 'Howard the Duck',
  studios: ['Universal Studios'],
  producers: ['Gloria Katz'],
  winner: true,
};

const underTheCherryMoon: Movie = {
  id: 37,
  year: 1986,
  title: 'Under the Cherry Moon',
  studios: ['Warner Bros.'],
  producers: ['Bob Cavallo', 'Joe Ruffalo', 'Steve Fargnoli'],
  winner: true,
};

describe('normalizeWinners', () => {
  it('keeps every movie of an array response', () => {
    expect(normalizeWinners([howardTheDuck, underTheCherryMoon])).toEqual([
      howardTheDuck,
      underTheCherryMoon,
    ]);
  });

  it('wraps a single movie object in a list', () => {
    expect(normalizeWinners(howardTheDuck)).toEqual([howardTheDuck]);
  });

  it('returns an empty list for an empty array', () => {
    expect(normalizeWinners([])).toEqual([]);
  });

  it('returns an empty list for a null or missing response', () => {
    expect(normalizeWinners(null)).toEqual([]);
    expect(normalizeWinners(undefined)).toEqual([]);
  });
});
