import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { YearWithMultipleWinners } from '../../../../core/api/models/year-with-multiple-winners.model';
import { MovieApiService } from '../../../../core/api/movie-api.service';
import { appErrorMessage } from '../../../../core/interceptors/app-http-error';
import { DataTableComponent, TableColumn } from '../../../../shared/ui/data-table/data-table';
import { ErrorStateComponent } from '../../../../shared/ui/error-state/error-state';
import { LoadingIndicatorComponent } from '../../../../shared/ui/loading-indicator/loading-indicator';
import { PanelComponent } from '../../../../shared/ui/panel/panel';

@Component({
  selector: 'app-multiple-winners-panel',
  imports: [PanelComponent, DataTableComponent, ErrorStateComponent, LoadingIndicatorComponent],
  host: { class: 'd-block h-100' },
  template: `
    <app-panel class="h-100" title="List years with multiple winners">
      @if (years.isLoading()) {
        <app-loading-indicator />
      } @else if (years.error()) {
        <app-error-state [message]="errorMessage()" (retry)="years.reload()" />
      } @else {
        <app-data-table
          [columns]="columns"
          [rows]="years.value()"
          [trackBy]="byYear"
          emptyMessage="No year has more than one winner"
        />
      }
    </app-panel>
  `,
})
export class MultipleWinnersPanel {
  private readonly api = inject(MovieApiService);

  protected readonly years = rxResource({
    stream: () => this.api.getYearsWithMultipleWinners(),
    defaultValue: [],
  });

  protected readonly errorMessage = computed(() => appErrorMessage(this.years.error()));

  protected readonly columns: readonly TableColumn<YearWithMultipleWinners>[] = [
    { key: 'year', header: 'Year' },
    { key: 'winnerCount', header: 'Win Count' },
  ];

  protected readonly byYear = (row: YearWithMultipleWinners): number => row.year;
}
