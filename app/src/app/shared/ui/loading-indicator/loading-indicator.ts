import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  host: { class: 'd-flex justify-content-center py-3' },
  template: `
    <div class="spinner-border spinner-border-sm text-secondary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  `,
})
export class LoadingIndicatorComponent {}
