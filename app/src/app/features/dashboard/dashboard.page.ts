import { Component } from '@angular/core';

import { PanelComponent } from '../../shared/ui/panel/panel';
import { MultipleWinnersPanel } from './panels/multiple-winners/multiple-winners-panel';
import { ProducerIntervalsPanel } from './panels/producer-intervals/producer-intervals-panel';
import { TopStudiosPanel } from './panels/top-studios/top-studios-panel';

@Component({
  selector: 'app-dashboard-page',
  imports: [PanelComponent, MultipleWinnersPanel, TopStudiosPanel, ProducerIntervalsPanel],
  template: `
    <div class="row g-3">
      <div class="col-12 col-lg-6">
        <app-multiple-winners-panel />
      </div>
      <div class="col-12 col-lg-6">
        <app-top-studios-panel />
      </div>
      <div class="col-12 col-lg-6">
        <app-producer-intervals-panel />
      </div>
      <div class="col-12 col-lg-6">
        <!-- Placeholder: the winners by year search is implemented in the next step. -->
        <app-panel class="h-100" title="List movie winners by year" />
      </div>
    </div>
  `,
})
export class DashboardPage {}
