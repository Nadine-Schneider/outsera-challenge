import { Component, input } from '@angular/core';

export type ColumnAlign = 'start' | 'center' | 'end';

export interface TableColumn<T> {
  readonly key: keyof T & string;
  readonly header: string;
  readonly align?: ColumnAlign;
}

const ALIGN_CLASS: Record<ColumnAlign, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
};

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.html',
  host: { class: 'd-block' },
})
export class DataTableComponent<T> {
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  readonly emptyMessage = input('No records found');
  readonly trackBy = input<(row: T) => unknown>((row) => row);

  protected readonly alignClass = ALIGN_CLASS;
}
