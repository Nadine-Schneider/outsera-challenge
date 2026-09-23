import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { ProducerInterval } from '../../../../core/api/models/producer-interval.model';
import { MovieApiService } from '../../../../core/api/movie-api.service';
import { appErrorMessage } from '../../../../core/interceptors/app-http-error';
import { DataTableComponent, TableColumn } from '../../../../shared/ui/data-table/data-table';
import { ErrorStateComponent } from '../../../../shared/ui/error-state/error-state';
import { LoadingIndicatorComponent } from '../../../../shared/ui/loading-indicator/loading-indicator';
import { PanelComponent } from '../../../../shared/ui/panel/panel';

@Component({
  selector: 'app-producer-intervals-panel',
  imports: [PanelComponent, DataTableComponent, ErrorStateComponent, LoadingIndicatorComponent],
  host: { class: 'd-block h-100' },
  templateUrl: './producer-intervals-panel.html',
})
export class ProducerIntervalsPanel {
  private readonly api = inject(MovieApiService);

  protected readonly intervals = rxResource({
    stream: () => this.api.getMaxMinWinIntervalForProducers(),
    defaultValue: { min: [], max: [] },
  });

  protected readonly errorMessage = computed(() => appErrorMessage(this.intervals.error()));

  protected readonly columns: readonly TableColumn<ProducerInterval>[] = [
    { key: 'producer', header: 'Producer' },
    { key: 'interval', header: 'Interval' },
    { key: 'previousWin', header: 'Previous Year' },
    { key: 'followingWin', header: 'Following Year' },
  ];

  /** The same producer can appear more than once, so the previous win completes the key. */
  protected readonly byProducerAndPreviousWin = (row: ProducerInterval): string =>
    `${row.producer}|${row.previousWin}`;
}
