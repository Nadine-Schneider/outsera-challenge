import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../core/api/api-base-url.token';
import { DashboardPage } from './dashboard.page';

const BASE_URL = 'https://api.test/movies';

describe('DashboardPage', () => {
  let element: HTMLElement;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(DashboardPage);
    element = fixture.nativeElement;
    TestBed.tick();
  });

  afterEach(() => {
    // The panels' requests are not under test here; discard them before verifying.
    httpMock.match(() => true);
    httpMock.verify();
  });

  it('fetches nothing itself: each panel issues its own request', () => {
    const urls = httpMock.match(() => true).map((req) => req.request.url);

    expect(urls.sort()).toEqual([
      `${BASE_URL}/maxMinWinIntervalForProducers`,
      `${BASE_URL}/studiosWithWinCount`,
      `${BASE_URL}/yearsWithMultipleWinners`,
    ]);
  });

  it('renders the four panels in the layout order', () => {
    const titles = Array.from(element.querySelectorAll('app-panel h2')).map((heading) =>
      heading.textContent?.trim(),
    );

    expect(titles).toEqual([
      'List years with multiple winners',
      'Top 3 studios with winners',
      'Producers with longest and shortest interval between wins',
      'List movie winners by year',
    ]);
  });

  it('places each panel in a column that is full width below lg and half width from lg', () => {
    const columns = Array.from(element.querySelectorAll('.row > div'));

    expect(columns).toHaveLength(4);
    columns.forEach((column) => {
      expect(column.classList).toContain('col-12');
      expect(column.classList).toContain('col-lg-6');
      expect(column.querySelectorAll('app-panel')).toHaveLength(1);
    });
  });
});
