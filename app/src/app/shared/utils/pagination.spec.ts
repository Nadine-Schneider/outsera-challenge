import { Page } from '../../core/api/models/page.model';
import { toApiPage, toPaginationState, toUiPage } from './pagination';

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
