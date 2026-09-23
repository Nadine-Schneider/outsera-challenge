import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  host: { class: 'd-block' },
  template: `<p class="text-body-secondary text-center small mb-0 py-3">{{ message() }}</p>`,
})
export class EmptyStateComponent {
  readonly message = input.required<string>();
}
