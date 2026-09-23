import { Component, input } from '@angular/core';

@Component({
  selector: 'app-panel',
  host: { class: 'd-block' },
  template: `
    <section class="card h-100 shadow-sm">
      <header class="card-header bg-transparent border-0 pb-0">
        <h2 class="h6 fw-bold mb-0">{{ title() }}</h2>
      </header>
      <div class="card-body">
        <ng-content />
      </div>
    </section>
  `,
})
export class PanelComponent {
  readonly title = input.required<string>();
}
