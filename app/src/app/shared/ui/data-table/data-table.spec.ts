import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableComponent, TableColumn } from './data-table';

interface Studio {
  readonly name: string;
  readonly winCount: number;
}

const COLUMNS: readonly TableColumn<Studio>[] = [
  { key: 'name', header: 'Name' },
  { key: 'winCount', header: 'Win Count', align: 'end' },
];

const STUDIOS: readonly Studio[] = [
  { name: 'Columbia Pictures', winCount: 6 },
  { name: 'Paramount Pictures', winCount: 6 },
  { name: 'Warner Bros.', winCount: 5 },
];

@Component({
  imports: [DataTableComponent],
  template: `
    <app-data-table
      [columns]="columns"
      [rows]="rows()"
      [trackBy]="byName"
      emptyMessage="No studios found"
    />
  `,
})
class PlainTableHost {
  readonly columns = COLUMNS;
  readonly rows = signal<readonly Studio[]>(STUDIOS);
  readonly byName = (studio: Studio): string => studio.name;
}

@Component({
  imports: [DataTableComponent],
  template: `
    <app-data-table [columns]="columns" [rows]="rows">
      <tr appTableFilters>
        <td><input aria-label="Filter by name" /></td>
        <td></td>
      </tr>
    </app-data-table>
  `,
})
class FilteredTableHost {
  readonly columns = COLUMNS;
  readonly rows = STUDIOS;
}

@Component({
  imports: [DataTableComponent],
  template: `
    <app-data-table [columns]="columns" [rows]="rows()" emptyMessage="Ignored">
      <strong appTableEmpty>Search to see studios</strong>
    </app-data-table>
  `,
})
class CustomEmptyTableHost {
  readonly columns = COLUMNS;
  readonly rows = signal<readonly Studio[]>([]);
}

function textOf(elements: NodeListOf<Element>): string[] {
  return Array.from(elements).map((element) => element.textContent?.trim() ?? '');
}

describe('DataTableComponent', () => {
  describe('without filters', () => {
    let fixture: ComponentFixture<PlainTableHost>;
    let element: HTMLElement;

    beforeEach(async () => {
      fixture = TestBed.createComponent(PlainTableHost);
      element = fixture.nativeElement;
      await fixture.whenStable();
    });

    it('renders the column headers in order, scoped to their columns', () => {
      const headers = element.querySelectorAll('thead th');

      expect(textOf(headers)).toEqual(['Name', 'Win Count']);
      headers.forEach((header) => expect(header.getAttribute('scope')).toBe('col'));
    });

    it('renders one body row per item, with cells in column order', () => {
      const rows = element.querySelectorAll('tbody tr');

      expect(rows).toHaveLength(3);
      expect(textOf(rows[0].querySelectorAll('td'))).toEqual(['Columbia Pictures', '6']);
      expect(textOf(rows[2].querySelectorAll('td'))).toEqual(['Warner Bros.', '5']);
    });

    it('applies the column alignment to the header and the cells', () => {
      expect(element.querySelectorAll('thead th')[1].classList).toContain('text-end');
      expect(element.querySelector('tbody tr td:nth-child(2)')?.classList).toContain('text-end');
    });

    it('shows the empty message across all columns when there are no rows', async () => {
      fixture.componentInstance.rows.set([]);
      await fixture.whenStable();

      const cells = element.querySelectorAll('tbody td');
      expect(cells).toHaveLength(1);
      expect(cells[0].textContent?.trim()).toBe('No studios found');
      expect(cells[0].getAttribute('colspan')).toBe('2');
    });

    it('renders only the column headers row in the header when no filters are projected', () => {
      const thead = element.querySelector('thead');

      expect(thead?.children).toHaveLength(1);
      expect(thead?.querySelectorAll('tr')).toHaveLength(1);
      expect(thead?.querySelectorAll('th[scope="col"]')).toHaveLength(COLUMNS.length);
      expect(element.querySelector('[appTableFilters]')).toBeNull();
    });

    it('wraps the table in a horizontally scrollable container', () => {
      expect(element.querySelector('table')?.parentElement?.classList).toContain(
        'table-responsive',
      );
    });
  });

  it('renders the projected filters as the second header row', async () => {
    const fixture = TestBed.createComponent(FilteredTableHost);
    const element: HTMLElement = fixture.nativeElement;
    await fixture.whenStable();

    const thead = element.querySelector('table > thead');
    const filtersRow = element.querySelector('[appTableFilters]');

    expect(element.querySelectorAll('[appTableFilters]')).toHaveLength(1);
    expect(filtersRow?.tagName).toBe('TR');
    expect(filtersRow?.parentElement).toBe(thead);
    expect(thead?.children).toHaveLength(2);
    expect(thead?.children[1]).toBe(filtersRow);
    expect(filtersRow?.querySelector('input')?.getAttribute('aria-label')).toBe('Filter by name');
  });

  it('shows "No records found" by default when there are no rows', async () => {
    const fixture = TestBed.createComponent(DataTableComponent<Studio>);
    const element: HTMLElement = fixture.nativeElement;
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('rows', []);
    await fixture.whenStable();

    expect(element.querySelector('tbody td')?.textContent?.trim()).toBe('No records found');
  });

  describe('with projected empty content', () => {
    let fixture: ComponentFixture<CustomEmptyTableHost>;
    let element: HTMLElement;

    beforeEach(async () => {
      fixture = TestBed.createComponent(CustomEmptyTableHost);
      element = fixture.nativeElement;
      await fixture.whenStable();
    });

    it('renders the projected content in place of the empty message', () => {
      const cell = element.querySelector('tbody td');

      expect(cell?.getAttribute('colspan')).toBe('2');
      expect(cell?.querySelector('strong[appTableEmpty]')?.textContent).toBe(
        'Search to see studios',
      );
      expect(cell?.textContent).not.toContain('Ignored');
    });

    it('hides the projected content once there are rows', async () => {
      fixture.componentInstance.rows.set(STUDIOS);
      await fixture.whenStable();

      expect(element.querySelectorAll('tbody tr')).toHaveLength(3);
      expect(element.querySelector('[appTableEmpty]')).toBeNull();
    });
  });
});
