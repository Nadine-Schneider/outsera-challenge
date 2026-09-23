/** Converts the one-based UI page to the zero-based API page. Pages below 1 map to the first page. */
export function toApiPage(uiPage: number): number {
  return Math.max(uiPage, 1) - 1;
}

/** Converts the zero-based API page to the one-based UI page. */
export function toUiPage(apiPage: number): number {
  return apiPage + 1;
}

export function visiblePageRange(
  currentPage: number,
  totalPages: number,
  maxVisible: number,
): number[] {
  if (totalPages < 1) {
    return [];
  }

  const windowSize = Math.min(Math.max(maxVisible, 1), totalPages);
  const current = Math.min(Math.max(currentPage, 1), totalPages);
  const lastStart = totalPages - windowSize + 1;
  const start = Math.min(Math.max(current - Math.floor(windowSize / 2), 1), lastStart);

  return Array.from({ length: windowSize }, (_, offset) => start + offset);
}
