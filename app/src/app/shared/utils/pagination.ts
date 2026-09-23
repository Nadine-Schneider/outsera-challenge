import { Page } from '../../core/api/models/page.model';

export interface PaginationState {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly isFirst: boolean;
  readonly isLast: boolean;
}

/** Converts the one-based UI page to the zero-based API page. Pages below 1 map to the first page. */
export function toApiPage(uiPage: number): number {
  return Math.max(uiPage, 1) - 1;
}

/** Converts the zero-based API page to the one-based UI page. */
export function toUiPage(apiPage: number): number {
  return apiPage + 1;
}

export function toPaginationState(page: Page<unknown>): PaginationState {
  return {
    currentPage: toUiPage(page.number),
    totalPages: page.totalPages,
    isFirst: page.first,
    isLast: page.last,
  };
}
