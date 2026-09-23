function cellTexts(cells: Iterable<Element>): string[] {
  return Array.from(cells, (cell) => cell.textContent?.trim() ?? '');
}

/** Column headers of the tables under `root`, in document order. */
export function tableHeaders(root: ParentNode): string[] {
  return cellTexts(root.querySelectorAll('thead th'));
}

/** Text of each body cell, row by row, as the user reads the tables under `root`. */
export function tableBodyRows(root: ParentNode): string[][] {
  return Array.from(root.querySelectorAll('tbody tr'), (row) =>
    cellTexts(row.querySelectorAll('td')),
  );
}
