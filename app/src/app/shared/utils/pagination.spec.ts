import { Page } from '../../core/api/models/page.model';
import { toApiPage, toPaginationState, toUiPage, visiblePageRange } from './pagination';

function page(overrides: Partial<Page<string>>): Page<string> {
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 15,
    first: true,
    last: true,
    ...overrides,
  };
}

describe('toApiPage', () => {
  it('converts the one-based UI page to the zero-based API page', () => {
    expect(toApiPage(1)).toBe(0);
    expect(toApiPage(5)).toBe(4);
  });

  it('maps pages below 1 to the first API page', () => {
    expect(toApiPage(0)).toBe(0);
    expect(toApiPage(-3)).toBe(0);
  });
});

describe('toUiPage', () => {
  it('converts the zero-based API page to the one-based UI page', () => {
    expect(toUiPage(0)).toBe(1);
    expect(toUiPage(4)).toBe(5);
  });

  it('is the inverse of toApiPage', () => {
    expect(toUiPage(toApiPage(7))).toBe(7);
  });
});

describe('toPaginationState', () => {
  it('describes the first of several pages', () => {
    const state = toPaginationState(
      page({ number: 0, totalPages: 11, totalElements: 164, first: true, last: false }),
    );

    expect(state).toEqual({ currentPage: 1, totalPages: 11, isFirst: true, isLast: false });
  });

  it('describes a page in the middle', () => {
    const state = toPaginationState(
      page({ number: 4, totalPages: 11, totalElements: 164, first: false, last: false }),
    );

    expect(state).toEqual({ currentPage: 5, totalPages: 11, isFirst: false, isLast: false });
  });

  it('describes the last page', () => {
    const state = toPaginationState(
      page({ number: 10, totalPages: 11, totalElements: 164, first: false, last: true }),
    );

    expect(state).toEqual({ currentPage: 11, totalPages: 11, isFirst: false, isLast: true });
  });

  it('describes a single page as both first and last', () => {
    const state = toPaginationState(
      page({ number: 0, totalPages: 1, totalElements: 3, first: true, last: true }),
    );

    expect(state).toEqual({ currentPage: 1, totalPages: 1, isFirst: true, isLast: true });
  });

  it('describes an empty result with no pages', () => {
    const state = toPaginationState(page({ number: 0, totalPages: 0, totalElements: 0 }));

    expect(state).toEqual({ currentPage: 1, totalPages: 0, isFirst: true, isLast: true });
  });
});

describe('visiblePageRange', () => {
  it('starts the window at the first page when the current page is near the start', () => {
    expect(visiblePageRange(1, 11, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(visiblePageRange(2, 11, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('centres the window on the current page in the middle of the range', () => {
    expect(visiblePageRange(6, 11, 5)).toEqual([4, 5, 6, 7, 8]);
  });

  it('keeps the current page in the window when the window size is even', () => {
    expect(visiblePageRange(6, 11, 4)).toEqual([4, 5, 6, 7]);
  });

  it('ends the window at the last page when the current page is near the end', () => {
    expect(visiblePageRange(10, 11, 5)).toEqual([7, 8, 9, 10, 11]);
    expect(visiblePageRange(11, 11, 5)).toEqual([7, 8, 9, 10, 11]);
  });

  it('shows every page when there are fewer pages than the window', () => {
    expect(visiblePageRange(2, 3, 5)).toEqual([1, 2, 3]);
  });

  it('returns no pages when there are no pages', () => {
    expect(visiblePageRange(1, 0, 5)).toEqual([]);
  });

  it('clamps a current page outside the range', () => {
    expect(visiblePageRange(0, 11, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(visiblePageRange(99, 11, 5)).toEqual([7, 8, 9, 10, 11]);
  });

  it('shows at least the current page when the window size is below 1', () => {
    expect(visiblePageRange(4, 11, 0)).toEqual([4]);
  });
});
