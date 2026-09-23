import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map } from 'rxjs';

import { MoviesQuery } from '../../core/api/models/movie.model';
import { MovieApiService } from '../../core/api/movie-api.service';
import { appErrorMessage } from '../../core/interceptors/app-http-error';
import { DataTableComponent, TableColumn } from '../../shared/ui/data-table/data-table';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state';
import { LoadingIndicatorComponent } from '../../shared/ui/loading-indicator/loading-indicator';
import { PaginationComponent } from '../../shared/ui/pagination/pagination';
import { PanelComponent } from '../../shared/ui/panel/panel';
import { MovieRow, toMovieRows } from '../../shared/utils/movie-row';
import { toApiPage } from '../../shared/utils/pagination';
import { parseYear, toYearDigits } from '../../shared/utils/year';

export const MOVIES_PAGE_SIZE = 15;
export const YEAR_FILTER_DEBOUNCE_MS = 400;

interface MovieFilters {
  readonly year?: number;
  readonly winner?: boolean;
}

interface MoviesResult {
  readonly rows: MovieRow[];
  readonly totalPages: number;
}

const EMPTY_RESULT: MoviesResult = { rows: [], totalPages: 0 };

@Component({
  selector: 'app-movies-list-page',
  imports: [
    PanelComponent,
    DataTableComponent,
    PaginationComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingIndicatorComponent,
  ],
  styles: `
    .year-filter {
      min-width: 7rem;
    }
    .winner-filter {
      min-width: 5.75rem;
    }
    .title-filter {
      min-width: 10rem;
    }
  `,
  template: `
    <app-panel title="List movies">
      <app-data-table [columns]="columns" [rows]="rows()" [trackBy]="byId">
        <tr appTableFilters>
          <td></td>
          <td>
            <input
              #yearInput
              type="text"
              class="form-control form-control-sm year-filter"
              inputmode="numeric"
              maxlength="4"
              placeholder="Filter by year"
              aria-label="Filter by year"
              autocomplete="off"
              [value]="yearFilter()"
              (input)="onYearInput(yearInput)"
            />
          </td>
          <td class="title-filter"></td>
          <td>
            <select
              #winnerSelect
              class="form-select form-select-sm winner-filter"
              aria-label="Filter by winner"
              (change)="onWinnerChange(winnerSelect.value)"
            >
              <option value="" [selected]="winnerFilter() === undefined">Yes/No</option>
              <option value="true" [selected]="winnerFilter() === true">Yes</option>
              <option value="false" [selected]="winnerFilter() === false">No</option>
            </select>
          </td>
        </tr>

        <div appTableEmpty>
          @if (movies.isLoading()) {
            <app-loading-indicator />
          } @else if (movies.error()) {
            <app-error-state [message]="errorMessage()" (retry)="movies.reload()" />
          } @else {
            <app-empty-state [message]="emptyMessage()" />
          }
        </div>
      </app-data-table>

      @if (!movies.error()) {
        <app-pagination
          class="d-block mt-3"
          [currentPage]="currentPage()"
          [totalPages]="totalPages()"
          (pageChange)="currentPage.set($event)"
        />
      }
    </app-panel>
  `,
})
export class MoviesListPage {
  private readonly api = inject(MovieApiService);

  protected readonly yearFilter = signal('');
  protected readonly winnerFilter = signal<boolean | undefined>(undefined);

  private readonly debouncedYear = toSignal(
    toObservable(this.yearFilter).pipe(debounceTime(YEAR_FILTER_DEBOUNCE_MS)),
    { initialValue: '' },
  );

  private readonly filters = computed<MovieFilters>(
    () => ({ year: parseYear(this.debouncedYear()), winner: this.winnerFilter() }),
    { equal: (a, b) => a.year === b.year && a.winner === b.winner },
  );

  protected readonly currentPage = linkedSignal({ source: this.filters, computation: () => 1 });

  protected readonly movies = rxResource({
    params: (): MoviesQuery => ({
      page: toApiPage(this.currentPage()),
      size: MOVIES_PAGE_SIZE,
      ...this.filters(),
    }),
    stream: ({ params }) =>
      this.api.getMovies(params).pipe(
        map((page): MoviesResult => ({
          rows: toMovieRows(page.content),
          totalPages: page.totalPages,
        })),
      ),
    defaultValue: EMPTY_RESULT,
  });

  protected readonly rows = computed(() =>
    this.movies.isLoading() || this.movies.error() ? [] : this.movies.value().rows,
  );

  protected readonly totalPages = linkedSignal<number | undefined, number>({
    source: () =>
      this.movies.isLoading() || this.movies.error() ? undefined : this.movies.value().totalPages,
    computation: (total, previous) => total ?? previous?.value ?? 0,
  });

  protected readonly errorMessage = computed(() => appErrorMessage(this.movies.error()));

  protected readonly emptyMessage = computed(() => {
    const { year, winner } = this.filters();
    return year === undefined && winner === undefined
      ? 'No movies found'
      : 'No movies match the current filters. Try adjusting the year or winner filter.';
  });

  protected readonly columns: readonly TableColumn<MovieRow>[] = [
    { key: 'id', header: 'ID' },
    { key: 'year', header: 'Year' },
    { key: 'title', header: 'Title' },
    { key: 'winner', header: 'Winner?' },
  ];

  protected readonly byId = (row: MovieRow): number => row.id;

  protected onYearInput(input: HTMLInputElement): void {
    input.value = toYearDigits(input.value);
    this.yearFilter.set(input.value);
  }

  protected onWinnerChange(value: string): void {
    this.winnerFilter.set(value === '' ? undefined : value === 'true');
  }
}
