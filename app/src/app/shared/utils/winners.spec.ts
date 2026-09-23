import { HOWARD_THE_DUCK, UNDER_THE_CHERRY_MOON } from '../../../testing/movie-fixtures';
import { normalizeWinners } from './winners';

describe('normalizeWinners', () => {
  it('keeps every movie of an array response', () => {
    expect(normalizeWinners([HOWARD_THE_DUCK, UNDER_THE_CHERRY_MOON])).toEqual([
      HOWARD_THE_DUCK,
      UNDER_THE_CHERRY_MOON,
    ]);
  });

  it('wraps a single movie object in a list', () => {
    expect(normalizeWinners(HOWARD_THE_DUCK)).toEqual([HOWARD_THE_DUCK]);
  });

  it('returns an empty list for an empty array', () => {
    expect(normalizeWinners([])).toEqual([]);
  });

  it('returns an empty list for a null or missing response', () => {
    expect(normalizeWinners(null)).toEqual([]);
    expect(normalizeWinners(undefined)).toEqual([]);
  });
});
