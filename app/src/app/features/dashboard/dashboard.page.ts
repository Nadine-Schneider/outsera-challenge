import { Component } from '@angular/core';

import { MultipleWinnersPanel } from './panels/multiple-winners/multiple-winners-panel';
import { ProducerIntervalsPanel } from './panels/producer-intervals/producer-intervals-panel';
import { TopStudiosPanel } from './panels/top-studios/top-studios-panel';
import { WinnersByYearPanel } from './panels/winners-by-year/winners-by-year-panel';

@Component({
  selector: 'app-dashboard-page',
  imports: [MultipleWinnersPanel, TopStudiosPanel, ProducerIntervalsPanel, WinnersByYearPanel],
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
        <app-winners-by-year-panel />
      </div>
    </div>
  `,
})
export class DashboardPage {}
