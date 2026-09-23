import { StudioWithWinCount } from '../../core/api/models/studio-with-win-count.model';
import { topStudios } from './studios';

const columbia: StudioWithWinCount = { name: 'Columbia Pictures', winCount: 7 };
const paramount: StudioWithWinCount = { name: 'Paramount Pictures', winCount: 6 };
const warner: StudioWithWinCount = { name: 'Warner Bros.', winCount: 5 };
const universal: StudioWithWinCount = { name: 'Universal Studios', winCount: 5 };
const tristar: StudioWithWinCount = { name: 'TriStar Pictures', winCount: 3 };

describe('topStudios', () => {
  it('returns the three studios with the most wins, in descending order', () => {
    expect(topStudios([tristar, paramount, columbia, warner])).toEqual([
      columbia,
      paramount,
      warner,
    ]);
  });

  it('breaks a tie for third place by name in alphabetical order', () => {
    expect(topStudios([warner, tristar, universal, paramount, columbia])).toEqual([
      columbia,
      paramount,
      universal,
    ]);
  });

  it('breaks ties by name regardless of the input order', () => {
    const tied = [warner, universal];

    expect(topStudios(tied)).toEqual([universal, warner]);
    expect(topStudios([...tied].reverse())).toEqual([universal, warner]);
  });

  it('returns every studio when there are fewer than three', () => {
    expect(topStudios([warner, columbia])).toEqual([columbia, warner]);
  });

  it('returns an empty list for an empty input', () => {
    expect(topStudios([])).toEqual([]);
  });

  it('honors a custom count', () => {
    expect(topStudios([warner, paramount, columbia], 1)).toEqual([columbia]);
    expect(topStudios([warner, paramount, columbia], 0)).toEqual([]);
  });

  it('does not modify the original array', () => {
    const studios = [tristar, warner, columbia, paramount];
    const snapshot = [...studios];

    const result = topStudios(studios);

    expect(studios).toEqual(snapshot);
    expect(result).not.toBe(studios);
  });
});
