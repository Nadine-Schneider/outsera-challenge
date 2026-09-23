import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Movie } from '../../../../core/api/models/movie.model';
import { MovieApiService } from '../../../../core/api/movie-api.service';
import { appErrorMessage } from '../../../../core/interceptors/app-http-error';
import { DataTableComponent, TableColumn } from '../../../../shared/ui/data-table/data-table';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state';
import { ErrorStateComponent } from '../../../../shared/ui/error-state/error-state';
import { LoadingIndicatorComponent } from '../../../../shared/ui/loading-indicator/loading-indicator';
import { PanelComponent } from '../../../../shared/ui/panel/panel';

const YEAR_PATTERN = /^\d{4}$/;

@Component({
  selector: 'app-winners-by-year-panel',
  imports: [
    FormsModule,
    PanelComponent,
    DataTableComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingIndicatorComponent,
  ],
  host: { class: 'd-block h-100' },
  template: `
    <app-panel class="h-100" title="List movie winners by year">
      <form class="input-group mb-3" role="search" (ngSubmit)="search()">
        <input
          #yearInput
          type="text"
          class="form-control"
          inputmode="numeric"
          maxlength="4"
          placeholder="Search by year"
          aria-label="Search winners by year"
          autocomplete="off"
          [value]="term()"
          (input)="onInput(yearInput)"
        />
        <button
          type="submit"
          class="btn btn-primary"
          aria-label="Search"
          [disabled]="!isValidTerm()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
            />
          </svg>
        </button>
      </form>

      @if (winners.isLoading()) {
        <app-loading-indicator />
      } @else if (winners.error()) {
        <app-error-state [message]="errorMessage()" (retry)="winners.reload()" />
      } @else {
        <app-data-table [columns]="columns" [rows]="winners.value()" [trackBy]="byId">
          <app-empty-state appTableEmpty [message]="emptyMessage()" />
        </app-data-table>
      }
    </app-panel>
  `,
})
export class WinnersByYearPanel {
  private readonly api = inject(MovieApiService);

  protected readonly term = signal('');
  private readonly submittedYear = signal<number | undefined>(undefined);

  protected readonly isValidTerm = computed(() => YEAR_PATTERN.test(this.term()));

  protected readonly winners = rxResource({
    params: () => this.submittedYear(),
    stream: ({ params: year }) => this.api.getWinnersByYear(year),
    defaultValue: [],
  });

  protected readonly errorMessage = computed(() => appErrorMessage(this.winners.error()));

  protected readonly emptyMessage = computed(() => {
    const year = this.submittedYear();
    return year === undefined ? 'Enter a year to see its winners' : `No winners found for ${year}`;
  });

  protected readonly columns: readonly TableColumn<Movie>[] = [
    { key: 'id', header: 'Id' },
    { key: 'year', header: 'Year' },
    { key: 'title', header: 'Title' },
  ];

  protected readonly byId = (movie: Movie): number => movie.id;

  protected onInput(input: HTMLInputElement): void {
    const digits = input.value.replace(/\D/g, '').slice(0, 4);
    input.value = digits;
    this.term.set(digits);
  }

  protected search(): void {
    if (!this.isValidTerm()) {
      return;
    }
    const year = Number(this.term());
    if (year === this.submittedYear()) {
      this.winners.reload();
    } else {
      this.submittedYear.set(year);
    }
  }
}
