import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { StudioWithWinCount } from '../../../../core/api/models/studio-with-win-count.model';
import { MovieApiService } from '../../../../core/api/movie-api.service';
import { appErrorMessage } from '../../../../core/interceptors/app-http-error';
import { DataTableComponent, TableColumn } from '../../../../shared/ui/data-table/data-table';
import { ErrorStateComponent } from '../../../../shared/ui/error-state/error-state';
import { LoadingIndicatorComponent } from '../../../../shared/ui/loading-indicator/loading-indicator';
import { PanelComponent } from '../../../../shared/ui/panel/panel';
import { topStudios } from '../../../../shared/utils/studios';

@Component({
  selector: 'app-top-studios-panel',
  imports: [PanelComponent, DataTableComponent, ErrorStateComponent, LoadingIndicatorComponent],
  host: { class: 'd-block h-100' },
  template: `
    <app-panel class="h-100" title="Top 3 studios with winners">
      @if (studios.isLoading()) {
        <app-loading-indicator />
      } @else if (studios.error()) {
        <app-error-state [message]="errorMessage()" (retry)="studios.reload()" />
      } @else {
        <app-data-table
          [columns]="columns"
          [rows]="studios.value()"
          [trackBy]="byName"
          emptyMessage="No studio has won yet"
        />
      }
    </app-panel>
  `,
})
export class TopStudiosPanel {
  private readonly api = inject(MovieApiService);

  protected readonly studios = rxResource({
    stream: () => this.api.getStudiosWithWinCount().pipe(map((studios) => topStudios(studios))),
    defaultValue: [],
  });

  protected readonly errorMessage = computed(() => appErrorMessage(this.studios.error()));

  protected readonly columns: readonly TableColumn<StudioWithWinCount>[] = [
    { key: 'name', header: 'Name' },
    { key: 'winCount', header: 'Win Count' },
  ];

  protected readonly byName = (row: StudioWithWinCount): string => row.name;
}
