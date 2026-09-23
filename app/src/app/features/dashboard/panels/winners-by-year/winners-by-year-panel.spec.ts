import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../core/api/api-base-url.token';
import { Movie } from '../../../../core/api/models/movie.model';
import { httpErrorInterceptor } from '../../../../core/interceptors/http-error.interceptor';
import { WinnersByYearPanel } from './winners-by-year-panel';

const BASE_URL = 'https://api.test/movies';
const URL = `${BASE_URL}/winnersByYear`;

const INITIAL_MESSAGE = 'Enter a year to see its winners';

const WINNERS_1986: Movie[] = [
  {
    id: 36,
    year: 1986,
    title: 'Howard the Duck',
    studios: ['Universal Studios'],
    producers: ['Gloria Katz'],
    winner: true,
  },
  {
    id: 37,
    year: 1986,
    title: 'Under the Cherry Moon',
    studios: ['Warner Bros.'],
    producers: ['Bob Cavallo', 'Joe Ruffalo', 'Steve Fargnoli'],
    winner: true,
  },
];

const WINNERS_1987: Movie[] = [
  {
    id: 41,
    year: 1987,
    title: 'Leonard Part 6',
    studios: ['Columbia Pictures'],
    producers: ['Bill Cosby'],
    winner: true,
  },
];

describe('WinnersByYearPanel', () => {
  let fixture: ComponentFixture<WinnersByYearPanel>;
  let element: HTMLElement;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(WinnersByYearPanel);
    element = fixture.nativeElement;
    // No request is issued on init, so the fixture stabilizes right away.
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function input(): HTMLInputElement {
    const field = element.querySelector<HTMLInputElement>('input');
    if (!field) {
      throw new Error('Search input not found');
    }
    return field;
  }

  function button(): HTMLButtonElement {
    const searchButton = element.querySelector<HTMLButtonElement>('button[aria-label="Search"]');
    if (!searchButton) {
      throw new Error('Search button not found');
    }
    return searchButton;
  }

  async function type(value: string): Promise<void> {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  function form(): HTMLFormElement {
    const searchForm = element.querySelector<HTMLFormElement>('form[role="search"]');
    if (!searchForm) {
      throw new Error('Search form not found');
    }
    return searchForm;
  }

  /** Clicking the submit button submits the form. */
  function clickSearch(): void {
    button().click();
    TestBed.tick();
  }

  /**
   * jsdom does not implement implicit submission, so Enter in the field is reproduced the way
   * the browser does it: the form is submitted without the button being clicked.
   */
  function pressEnter(): void {
    form().requestSubmit();
    TestBed.tick();
  }

  async function respond(year: number, body: Movie[]): Promise<void> {
    const req = httpMock.expectOne((request) => request.url === URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('year')).toBe(String(year));
    req.flush(body);
    await fixture.whenStable();
  }

  async function fail(year: number): Promise<void> {
    const req = httpMock.expectOne((request) => request.url === URL);
    expect(req.request.params.get('year')).toBe(String(year));
    req.flush('Server error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
  }

  function headers(): string[] {
    return Array.from(element.querySelectorAll('thead th')).map(
      (th) => th.textContent?.trim() ?? '',
    );
  }

  function bodyRows(): string[][] {
    return Array.from(element.querySelectorAll('tbody tr')).map((row) =>
      Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim() ?? ''),
    );
  }

  it('renders the panel title and an accessible search field', () => {
    expect(element.querySelector('h2')?.textContent?.trim()).toBe('List movie winners by year');
    expect(input().getAttribute('placeholder')).toBe('Search by year');
    expect(input().getAttribute('aria-label')).toBe('Search winners by year');
    expect(input().getAttribute('inputmode')).toBe('numeric');
    expect(input().getAttribute('maxlength')).toBe('4');
  });

  it('makes no request on init and shows the column headers with the initial message', () => {
    httpMock.expectNone(() => true);

    expect(headers()).toEqual(['Id', 'Year', 'Title']);
    expect(bodyRows()).toEqual([[INITIAL_MESSAGE]]);
    expect(element.querySelector('tbody td')?.getAttribute('colspan')).toBe('3');
    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('keeps the button disabled while the field is empty or has fewer than 4 digits', async () => {
    expect(button().disabled).toBe(true);

    for (const partial of ['1', '19', '198']) {
      await type(partial);
      expect(button().disabled).toBe(true);
    }
  });

  it('does not search when the form is submitted with an incomplete value', async () => {
    await type('198');
    // Bypasses the disabled button to exercise the validation guard in search().
    form().dispatchEvent(new Event('submit', { cancelable: true }));
    TestBed.tick();

    httpMock.expectNone(() => true);
    expect(bodyRows()).toEqual([[INITIAL_MESSAGE]]);
  });

  it('uses a submit button with a decorative icon inside a search form', () => {
    expect(button().type).toBe('submit');
    expect(button().form).toBe(form());
    expect(button().querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps only digits, up to 4 characters', async () => {
    await type('19a8-6x7');

    expect(input().value).toBe('1986');
    expect(button().disabled).toBe(false);
  });

  it('enables the button with 4 digits and searches the typed year on click', async () => {
    await type('1986');
    expect(button().disabled).toBe(false);

    clickSearch();
    expect(element.querySelector('[role="status"]')).not.toBeNull();

    await respond(1986, WINNERS_1986);
    expect(element.querySelector('[role="status"]')).toBeNull();
  });

  it('searches on Enter with the same request as the click', async () => {
    await type('1987');
    pressEnter();

    await respond(1987, WINNERS_1987);
    expect(bodyRows()).toEqual([['41', '1987', 'Leonard Part 6']]);
  });

  it('renders one row per winner with Id, Year and Title', async () => {
    await type('1986');
    clickSearch();
    await respond(1986, WINNERS_1986);

    expect(headers()).toEqual(['Id', 'Year', 'Title']);
    expect(bodyRows()).toEqual([
      ['36', '1986', 'Howard the Duck'],
      ['37', '1986', 'Under the Cherry Moon'],
    ]);
  });

  it('shows a message naming the year when it has no winners', async () => {
    await type('1950');
    clickSearch();
    await respond(1950, []);

    expect(bodyRows()).toEqual([['No winners found for 1950']]);
    expect(element.querySelector('tbody td')?.getAttribute('colspan')).toBe('3');
    expect(element.textContent).not.toContain(INITIAL_MESSAGE);
  });

  it('shows the error state and retries the same year on "Try again"', async () => {
    await type('1986');
    clickSearch();
    await fail(1986);

    const alert = element.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain(
      'The server is unavailable at the moment. Please try again later.',
    );
    expect(element.querySelector('table')).toBeNull();

    alert?.querySelector('button')?.click();
    TestBed.tick();
    await respond(1986, WINNERS_1986);

    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(bodyRows()).toHaveLength(2);
  });

  it('replaces the previous result when a second year is searched', async () => {
    await type('1986');
    clickSearch();
    await respond(1986, WINNERS_1986);

    await type('1987');
    clickSearch();
    await respond(1987, WINNERS_1987);

    expect(bodyRows()).toEqual([['41', '1987', 'Leonard Part 6']]);
  });

  it('searches again when the same year is submitted twice', async () => {
    await type('1987');
    clickSearch();
    await respond(1987, WINNERS_1987);

    clickSearch();
    await respond(1987, WINNERS_1987);

    expect(bodyRows()).toEqual([['41', '1987', 'Leonard Part 6']]);
  });
});
