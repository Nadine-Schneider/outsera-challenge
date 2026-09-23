import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  host: { class: 'd-block' },
  template: `
    <div
      class="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2 mb-0 py-2"
      role="alert"
    >
      <span>{{ message() }}</span>
      <button type="button" class="btn btn-sm btn-outline-danger" (click)="retry.emit()">
        Try again
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly message = input('Something went wrong. Please try again.');
  readonly retry = output<void>();
}
