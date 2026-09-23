import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  SERVER_ERROR_MESSAGE,
  TEST_API_BASE_URL,
  flushServerError,
  provideApiTesting,
} from '../../../testing/api-testing';
import { HOWARD_THE_DUCK, UNDER_THE_CHERRY_MOON } from '../../../testing/movie-fixtures';
import { tableBodyRows } from '../../../testing/table-queries';
import { MaxMinWinIntervals } from '../../core/api/models/producer-interval.model';
import { StudiosWithWinCountResponse } from '../../core/api/models/studio-with-win-count.model';
import { YearsWithMultipleWinnersResponse } from '../../core/api/models/year-with-multiple-winners.model';
import { DashboardPage } from './dashboard.page';

interface DataPanel {
  readonly title: string;
  readonly url: string;
  readonly body:
    YearsWithMultipleWinnersResponse | StudiosWithWinCountResponse | MaxMinWinIntervals;
  readonly rows: string[][];
}

const DATA_PANELS: readonly DataPanel[] = [
  {
    title: 'List years with multiple winners',
    url: `${TEST_API_BASE_URL}/yearsWithMultipleWinners`,
    body: { years: [{ year: 1986, winnerCount: 2 }] },
    rows: [['1986', '2']],
  },
  {
    title: 'Top 3 studios with winners',
    url: `${TEST_API_BASE_URL}/studiosWithWinCount`,
    body: { studios: [{ name: 'Columbia Pictures', winCount: 7 }] },
    rows: [['Columbia Pictures', '7']],
  },
  {
    title: 'Producers with longest and shortest interval between wins',
    url: `${TEST_API_BASE_URL}/maxMinWinIntervalForProducers`,
    body: {
      max: [{ producer: 'Matthew Vaughn', interval: 13, previousWin: 2002, followingWin: 2015 }],
      min: [{ producer: 'Joel Silver', interval: 1, previousWin: 1990, followingWin: 1991 }],
    },
    rows: [
      ['Matthew Vaughn', '13', '2002', '2015'],
      ['Joel Silver', '1', '1990', '1991'],
    ],
  },
];

const SEARCH_PANEL_TITLE = 'List movie winners by year';

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let element: HTMLElement;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: provideApiTesting() });
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(DashboardPage);
    element = fixture.nativeElement;
    // The pending requests keep the fixture unstable, so trigger the first render synchronously.
    TestBed.tick();
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** Answers every data panel successfully, except the ones listed in `failing`. */
  async function respondToPanels(failing: readonly DataPanel[] = []): Promise<void> {
    for (const panel of DATA_PANELS) {
      const req = httpMock.expectOne(panel.url);
      if (failing.includes(panel)) {
        flushServerError(req);
      } else {
        req.flush(panel.body);
      }
    }
    await fixture.whenStable();
  }

  function panelNamed(title: string): Element {
    const panel = Array.from(element.querySelectorAll('app-panel')).find(
      (candidate) => candidate.querySelector('h2')?.textContent?.trim() === title,
    );
    if (!panel) {
      throw new Error(`Panel "${title}" not found`);
    }
    return panel;
  }

  it('lets each data panel issue its own request, and the year search none', () => {
    const urls = httpMock.match(() => true).map((req) => req.request.url);

    expect(urls.sort()).toEqual(DATA_PANELS.map((panel) => panel.url).sort());
  });

  it('renders the four panels in the layout order', async () => {
    await respondToPanels();

    const titles = Array.from(element.querySelectorAll('app-panel h2')).map((heading) =>
      heading.textContent?.trim(),
    );

    expect(titles).toEqual([...DATA_PANELS.map((panel) => panel.title), SEARCH_PANEL_TITLE]);
  });

  it('places each panel in a column that is full width below lg and half width from lg', async () => {
    await respondToPanels();

    const columns = Array.from(element.querySelectorAll('.row > div'));

    expect(columns).toHaveLength(4);
    columns.forEach((column) => {
      expect(column.classList).toContain('col-12');
      expect(column.classList).toContain('col-lg-6');
      expect(column.querySelectorAll('app-panel')).toHaveLength(1);
    });
  });

  it.each(DATA_PANELS)('keeps the other panels working when "$title" fails', async (failed) => {
    await respondToPanels([failed]);

    const failedPanel = panelNamed(failed.title);
    expect(failedPanel.querySelector('[role="alert"]')?.textContent).toContain(
      SERVER_ERROR_MESSAGE,
    );
    expect(failedPanel.querySelector('table')).toBeNull();
    expect(element.querySelectorAll('[role="alert"]')).toHaveLength(1);

    for (const panel of DATA_PANELS.filter((candidate) => candidate !== failed)) {
      expect(tableBodyRows(panelNamed(panel.title))).toEqual(panel.rows);
    }
  });

  it('keeps the year search working when every data panel fails', async () => {
    await respondToPanels(DATA_PANELS);
    expect(element.querySelectorAll('[role="alert"]')).toHaveLength(DATA_PANELS.length);

    const searchPanel = panelNamed(SEARCH_PANEL_TITLE);
    const input = searchPanel.querySelector<HTMLInputElement>('input');
    if (!input) {
      throw new Error('Search input not found');
    }
    input.value = '1986';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    searchPanel.querySelector<HTMLButtonElement>('button[aria-label="Search"]')?.click();
    TestBed.tick();

    httpMock
      .expectOne(`${TEST_API_BASE_URL}/winnersByYear?year=1986`)
      .flush([HOWARD_THE_DUCK, UNDER_THE_CHERRY_MOON]);
    await fixture.whenStable();

    expect(searchPanel.querySelector('[role="alert"]')).toBeNull();
    expect(tableBodyRows(searchPanel)).toEqual([
      ['36', '1986', 'Howard the Duck'],
      ['37', '1986', 'Under the Cherry Moon'],
    ]);
  });
});
