import { parseYear, toYearDigits } from './year';

describe('parseYear', () => {
  it('parses a 4-digit year', () => {
    expect(parseYear('1986')).toBe(1986);
    expect(parseYear(' 2015 ')).toBe(2015);
  });

  it('treats empty, partial, longer or non-numeric values as absent', () => {
    for (const value of ['', '1', '198', '19860', '19a6', '-198']) {
      expect(parseYear(value)).toBeUndefined();
    }
  });
});

describe('toYearDigits', () => {
  it('keeps only digits', () => {
    expect(toYearDigits('19a8-6')).toBe('1986');
  });

  it('keeps at most 4 digits', () => {
    expect(toYearDigits('198675')).toBe('1986');
  });

  it('returns an empty string when there are no digits', () => {
    expect(toYearDigits('')).toBe('');
    expect(toYearDigits('abc')).toBe('');
  });
});
